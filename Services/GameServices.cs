using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameServices(IUnitOfWork uof, IMapper mapper) : IGameServices
{
    public async Task<IEnumerable<GameDto>> GetAsync(GetGameDto param, CancellationToken token)
    {
        var entities = await uof.Games.GetListAsync<GameDto>(g => g.Title.Contains(param.Search), token);

        return entities;
    }

    public async Task<Game> InsertAsync(GameDto game, CancellationToken token)
    {
        var entity = mapper.Map<Game>(game);
        uof.Games.Insert(entity);
        await uof.SaveAsync(token);

        return entity;
    }

    public async Task<IEnumerable<Game>> InsertRangeAsync(IEnumerable<GameDto> games, CancellationToken token)
    {
        var entities = mapper.Map<IEnumerable<Game>>(games);

        uof.Games.InsertRange(entities);
        await uof.SaveAsync(token);

        return entities;
    }
}