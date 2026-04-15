using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IGameServices
{
    Task<IEnumerable<GameDto>> GetAsync(GetGameDto param ,CancellationToken token);
    Task<Game> InsertAsync(GameDto game, CancellationToken token);

    Task<IEnumerable<Game>> InsertRangeAsync(IEnumerable<GameDto> games, CancellationToken token);
}