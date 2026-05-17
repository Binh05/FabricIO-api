using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IGameRatingService
{
    Task<GameRatingResponse> GetRatingsAsync(Guid gameId, CancellationToken token);
    Task<int> RatingAsync(Guid userId, Guid gameId, RatingRequest req, CancellationToken token);
    Task DeleteAsync(Guid ratingId, CancellationToken token);
}
