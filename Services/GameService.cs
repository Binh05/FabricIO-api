using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameService(IUnitOfWork unitOfWork, IMapper mapper, IStorageService storageService) : IGameServices
{
    private readonly string gameBucket = "game-assets";
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

        if (gameReq.Thumbnail == null)
        {
            throw new BadRequestException("Thiếu ảnh đại diện của game");
        }

        var thumbKey = $"{entity.Id}/thumbnails/{entity.Id}.png"; // relative path without bucketname
        entity.ThumbnailUrl = await storageService.UploadFileAsync(gameReq.Thumbnail, "game-assets", thumbKey, token);

        //if (gameReq.GameType == GameType.Browser)
        //{
        if (gameReq.GameFile == null)
            throw new BadRequestException("Browser game cần file zip");

        var path = await storageService.ExtractAndUploadAsync(gameReq.GameFile, entity.Id, token); // return relavtive path with bucket name
        await storageService.UploadFileAsync(gameReq.GameFile, gameBucket, $"{entity.Id}/source.zip", token);

        entity.GameUrl = $"{path}/index.html"; // relative path


        if (gameReq.TagIds != null && gameReq.TagIds.Any())
        {
            await AddTagIds(entity, gameReq.TagIds, token);
        }

        entity.OwnerId = userId;
        unitOfWork.Games.Insert(entity);
        await unitOfWork.SaveAsync(token);

        var result = await unitOfWork.Games.FindOneAsync<GameResponseDto>(g => g.Id == entity.Id, token);
        
        return result!;
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

        return game.GameUrl;
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

        await unitOfWork.BeginTransactionAsync(token);
        try
        {
            if (req.Thumbnail != null)
            {
                game.ThumbnailUrl = await storageService.UploadFileAsync(req.Thumbnail, "file", $"avatars/{game.OwnerId}", token);
            }

            if (req.GameFile != null)
            {
                var path = await storageService.ExtractAndUploadAsync(req.GameFile, gameId, token);
                await storageService.UploadFileAsync(req.GameFile, gameBucket, $"{gameId}/source.zip", token);

                game.GameUrl = $"{path}/index.html";
            }

            if (req.TagIds != null)
            {
                game.GameTagMaps.Clear();

                await AddTagIds(game, req.TagIds, token);
            }

            await unitOfWork.CommitAsync(token);
        }
        catch
        {
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
}