using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IGameServices
{
    Task<GameResponseDto> GetByIdAsync(Guid gameId, CancellationToken token);
    Task<GameResponseDto> CreateGameAsync(Guid userId, GameRequestDto gameReq, CancellationToken token);
    Task<string> GetPlayUrlAsync(Guid userId, Guid gameId, CancellationToken token);
    Task<GamePaginationResult> GetAllAsync(Guid? userId, GetPaginationGameDto param ,CancellationToken token);
    Task InsertAsync(Guid userId, Game game, CancellationToken token);
    Task<GameResponseDto> UpdateGameAsync(Guid userId, Guid gameId, UpdateGameRequest req, CancellationToken token);
    Task DeleteAsync(Guid userId, UserRole role, Guid gameId, CancellationToken token);
    Task<IEnumerable<Game>> InsertRangeAsync(IEnumerable<GameRequestDto> games, CancellationToken token);
    Task<GameDownloadDto> DownloadGameAsync(Guid gameId, CancellationToken token);
    Task<FeaturedGameResponse?> GetGamePlayHighestAsync(CancellationToken token);
    Task<IEnumerable<FeaturedGameRatingResponse>> GetTopRatingGamesAsync(int top, CancellationToken token);
}