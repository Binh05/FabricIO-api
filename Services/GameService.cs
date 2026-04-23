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
        return await unitOfWork.Games.GetByIdAsync<GameResponseDto>(gameId, token);
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

        if (gameReq.Thumbnail != null)
        {
            var thumbKey = $"{entity.Id}/thumbnails/{entity.Id}.png";
            await storageService.UploadFileAsync(gameReq.Thumbnail, "game-assets", thumbKey, token);
            entity.ThumbnailUrl = storageService.GetPublicUrl(thumbKey);
        }

        //if (gameReq.GameType == GameType.Browser)
        //{
        if (gameReq.GameFile == null)
            throw new Exception("Browser game cần file zip");

        var zipPath = Path.GetTempFileName();

        using (var stream = File.Create(zipPath))
        {
            await gameReq.GameFile.CopyToAsync(stream);
        }

        var path = await storageService.ExtractAndUploadAsync(zipPath, entity.Id, token);
        await storageService.UploadFileAsync(gameReq.GameFile, gameBucket, $"{path}/source.zip", token);

        entity.GameUrl = storageService.GetPublicUrl($"{path}/index.html");
        //}

        if (gameReq.TagIds != null && gameReq.TagIds.Any())
        {
            var validTags = await unitOfWork.GameTags.GetListAsync<GameTag>(t => gameReq.TagIds.Contains(t.Id), token);
            entity.GameTagMaps = validTags.Select(t => new GameTagMap
            {
                TagId = t.Id,
                GameId = entity.Id
            }).ToList();
        }

        entity.OwnerId = userId;
        unitOfWork.Games.Insert(entity);
        await unitOfWork.SaveAsync(token);

        var result = await unitOfWork.Games.FindOneAsync<GameResponseDto>(g => g.Id == entity.Id, token);
        return result!;
    }

    public async Task<string> GetPlayUrlAsync(Guid gameId, CancellationToken token)
    {
        var game = await unitOfWork.Games.GetEntityAsync(g => g.Id == gameId, token);

        if (game == null || game.GameType != GameType.Browser)
            throw new Exception("Game không hỗ trợ play");

        return game.GameUrl!;
    }

    public async Task<IEnumerable<GameResponseDto>> GetAsync(GetGameDto param, CancellationToken token)
    {
        var entities = await unitOfWork.Games.GetListAsync<GameResponseDto>(g => g.Title.Contains(param.Search), token);

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
}