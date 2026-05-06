using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameService(IUnitOfWork unitOfWork, IMapper mapper, IStorageService storageService, IConfiguration configuration) : IGameServices
{
    private readonly string gameBucket = "game-assets";
    private readonly string ThumbnailFolderName = "thumbnails";
    private readonly string GameFolderName = "game-dist";
    private readonly string _domain = configuration["AppSettings:Domain"] ?? "http://localhost:9000";
    public async Task<GameResponseDto> GetByIdAsync(Guid gameId, CancellationToken token)
    {
        var result = await unitOfWork.Games.GetByIdAsync<GameResponseDto>(gameId, token);

        return result;
    }
    public async Task<GameResponseDto> CreateGameAsync(Guid userId, GameRequestDto gameReq, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (user == null || user.IsGameBanned)
        {
            throw new ForbidException("Không có quyền đăng tải game");
        }

        var entity = mapper.Map<Game>(gameReq);
        entity.Id = Guid.NewGuid();

        string rootGamePath = entity.Id.ToString();
        string thumbKey = $"{rootGamePath}/{ThumbnailFolderName}/{FormatThumbnail(gameReq.Thumbnail.FileName, entity.Id.ToString())}"; // relative path without bucketname

        await unitOfWork.BeginTransactionAsync(token);
        try
        {
            
            entity.ThumbnailUrl = await storageService.UploadFileAsync(gameReq.Thumbnail, gameBucket, thumbKey, token);

            entity.GameUrl = await storageService.ExtractAndUploadAsync(gameReq.GameFile, $"{rootGamePath}/{GameFolderName}-{entity.Id}", token); // return with full url
            await storageService.UploadFileAsync(gameReq.GameFile, gameBucket, $"{rootGamePath}/source-{entity.Id}.zip", token);

            if (gameReq.TagIds != null && gameReq.TagIds.Any())
            {
                await AddTagIds(entity, gameReq.TagIds, token);
            }

            entity.OwnerId = userId;
            unitOfWork.Games.Insert(entity);

            await unitOfWork.CommitAsync(token);
        }
        catch
        {
            await storageService.DeleteFolderAsync(gameBucket, rootGamePath, token);
            await unitOfWork.RollBackAsync(token);
        }

        return await unitOfWork.Games.GetByIdAsync<GameResponseDto>(entity.Id, token);
    }

    public async Task<string> GetPlayUrlAsync(Guid userId, Guid gameId, CancellationToken token)
    {
        var game = await unitOfWork.Games.GetEntityAsync(g => g.Id == gameId, token);

        if (game == null || game.GameType != GameType.Browser || game.GameUrl == null)
            throw new Exception("Game không hỗ trợ play");

        var gamePlay = new GamePlay
        {
            UserId = userId,
            GameId = gameId
        };

        unitOfWork.GamePlays.Insert(gamePlay);
        await unitOfWork.SaveAsync(token);

        return $"{game.GameUrl}/index.html";
    }

    public async Task<GamePaginationResult> GetAllAsync(Guid? userId, GetPaginationGameDto param, CancellationToken token)
    {
        var entities = await unitOfWork.Games.GetPaginationGameAsync(userId, param, token);

        return entities;
    }

    public async Task InsertAsync(Guid userId, Game game, CancellationToken token)
    {
        game.OwnerId = userId;

        unitOfWork.Games.Insert(game);
        await unitOfWork.SaveAsync(token);
    }
    public async Task DeleteAsync(Guid userId, Guid gameId, CancellationToken token)
    {
        var game = await unitOfWork.Games.GetEntityAsync(g => g.Id == gameId, token);
        if (game == null)
        {
            throw new NotFoundException("Game không tồn tại");
        }

        if (game.OwnerId != userId)
        {
            throw new UnauthorizedException("Bạn không có quyền xóa game này");
        }

        unitOfWork.Games.Delete(game);
        await unitOfWork.SaveAsync(token);

        await storageService.DeleteFolderAsync(gameBucket, $"{gameId}/", token);
    }

    public async Task<IEnumerable<Game>> InsertRangeAsync(IEnumerable<GameRequestDto> games, CancellationToken token)
    {
        var entities = mapper.Map<IEnumerable<Game>>(games);

        unitOfWork.Games.InsertRange(entities);
        await unitOfWork.SaveAsync(token);

        return entities;
    }

    public async Task<GameDownloadDto> DownloadGameAsync(Guid gameId, CancellationToken token)
    {
        var url = await storageService.DownloadFileAync(gameId, token);

        return new GameDownloadDto { DownloadUrl = url };
    }

    public async Task<FeaturedGameResponse?> GetGamePlayHighestAsync(CancellationToken token)
    {
        var entity = await unitOfWork.GamePlays.GetFeaturedGameAsync(token);

        return entity;
    }

    public async Task<IEnumerable<FeaturedGameRatingResponse>> GetTopRatingGamesAsync(int top, CancellationToken token)
    {
        var result = await unitOfWork.Games.GetTopGameRatingsAsync(top, token);

        return result;
    }

    public async Task<GameResponseDto> UpdateGameAsync(Guid userId, Guid gameId, UpdateGameRequest req, CancellationToken token)
    {
        var game = await unitOfWork.Games.GetGameWithTagMapsAsync(gameId, token);
        if (game == null)
        {
            throw new NotFoundException("Game khong ton tai");
        }

        if (game.OwnerId != userId)
        {
            throw new UnauthorizedException("Khong co quyen sua game nay");
        }

        mapper.Map(req, game);

        string? gameUploadPath = null;
        string? oldGameUrl = null;

        string? thumbnailUploadUrl = null;
        string? oldThumbnailUploadUrl = null;

        string newRootPath = game.Id.ToString();
        string gameSessionId = Guid.NewGuid().ToString();

        await unitOfWork.BeginTransactionAsync(token);
        try
        {
            if (req.Thumbnail != null)
            {
                thumbnailUploadUrl = $"{newRootPath}/{ThumbnailFolderName}/{FormatThumbnail(req.Thumbnail.FileName, gameSessionId)}";
                oldThumbnailUploadUrl = game.ThumbnailUrl;

                game.ThumbnailUrl = await storageService.UploadFileAsync(req.Thumbnail, gameBucket, thumbnailUploadUrl, token);
            }

            if (req.GameFile != null)
            {
                gameUploadPath = $"{newRootPath}/{GameFolderName}-{gameSessionId}";
                oldGameUrl = game.GameUrl;

                game.GameUrl = await storageService.ExtractAndUploadAsync(req.GameFile, gameUploadPath, token);
                await storageService.UploadFileAsync(req.GameFile, gameBucket, $"{newRootPath}/source-{gameSessionId}.zip", token);
            }

            if (req.TagIds != null)
            {
                game.GameTagMaps.Clear();

                await AddTagIds(game, req.TagIds, token);
            }

            await unitOfWork.CommitAsync(token);

            if (!string.IsNullOrEmpty(oldThumbnailUploadUrl))
            {
                await storageService.DeleteFileByUrlAsync(oldThumbnailUploadUrl, token);
            }

            if (!string.IsNullOrEmpty(oldGameUrl) && oldGameUrl != game.GameUrl)
            {
                await storageService.DeleteFolderAsync(gameBucket, oldGameUrl, token);
                if (oldGameUrl.Contains($"/{GameFolderName}-"))
                {
                    string oldZipUrl = oldGameUrl.Replace($"/{GameFolderName}-", "/source-") + ".zip";
                    await storageService.DeleteFileByUrlAsync(oldZipUrl, token);
                }
            }
        }
        catch
        {
            if (!string.IsNullOrEmpty(thumbnailUploadUrl))
            {
                await storageService.DeleteFileByUrlAsync(thumbnailUploadUrl, token);
            }

            if (!string.IsNullOrEmpty(gameUploadPath))
            {
                await storageService.DeleteFolderAsync(gameBucket, gameUploadPath, token);
                string newZipKey = $"{gameBucket}/{newRootPath}/source-{gameSessionId}.zip";
                await storageService.DeleteFileByUrlAsync(newZipKey, token);
            }
            
            await unitOfWork.RollBackAsync(token);
            throw;
        }

        return await unitOfWork.Games.GetByIdAsync<GameResponseDto>(gameId, token);
    }

    private async Task AddTagIds(Game entity, List<Guid> tagIds, CancellationToken token)
    {
        var validTags = await unitOfWork.GameTags.GetListAsync<GameTag>(t => tagIds.Contains(t.Id), token);
        if (validTags == null || validTags.Count() == 0)
        {
            throw new BadRequestException("Không có tag nào hợp lệ");
        }
        entity.GameTagMaps = validTags.Select(t => new GameTagMap
        {
            TagId = t.Id,
            GameId = entity.Id
        }).ToList();
    }

    private string FormatThumbnail(string fileName, string? id = null)
    {
        return "thumbnail-" + (id ?? Guid.NewGuid().ToString()) + Path.GetExtension(fileName);
    }
}