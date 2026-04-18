using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameServices(IUnitOfWork uof, IMapper mapper) : IGameServices
{
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
        var entities = await uof.Games.GetListAsync<GameResponseDto>(g => g.Title.Contains(param.Search), token);

        return entities;
    }

    public async Task InsertAsync(Guid userId, Game game, CancellationToken token)
    {
        game.OwnerId = userId;

        uof.Games.Insert(game);
        await uof.SaveAsync(token);
    }

    public async Task<IEnumerable<Game>> InsertRangeAsync(IEnumerable<GameRequestDto> games, CancellationToken token)
    {
        var entities = mapper.Map<IEnumerable<Game>>(games);

        uof.Games.InsertRange(entities);
        await uof.SaveAsync(token);

        return entities;
    }
}