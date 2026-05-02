using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork
{
    public interface IGameRatingRepository : IRepository<GameRating>
    {
        Task<GameRatingResponse> GetRatingAsync(Guid gameId, CancellationToken token);
    }
}
