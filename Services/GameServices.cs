using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameServices(IUnitOfWork unitOfWork, IMapper mapper) : IGameServices
{
    public async Task<GameResponseDto> CreateGameAsync(Guid userId, GameRequestDto gameReq, CancellationToken token)
    {
        var entity = mapper.Map<Game>(gameReq);

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
    public Game AddGameTag(Game game, IEnumerable<GameTag> gameTags)
    {
        var gameTagMaps = gameTags.Select(t => new GameTagMap
        {
            GameId = game.Id,
            TagId = t.Id,
        });

        game.GameTagMaps = gameTagMaps.ToList();

        return game;
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

    public async Task<IEnumerable<Game>> InsertRangeAsync(IEnumerable<GameRequestDto> games, CancellationToken token)
    {
        var entities = mapper.Map<IEnumerable<Game>>(games);

        unitOfWork.Games.InsertRange(entities);
        await unitOfWork.SaveAsync(token);

        return entities;
    }
}