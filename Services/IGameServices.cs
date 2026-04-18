using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IGameServices
{
    Task<IEnumerable<GameResponseDto>> GetAsync(GetGameDto param ,CancellationToken token);
    Task InsertAsync(Guid userId, Game game, CancellationToken token);
    Task<IEnumerable<Game>> InsertRangeAsync(IEnumerable<GameRequestDto> games, CancellationToken token);
    Game AddGameTag(Game game, IEnumerable<GameTag> gameTag);
}