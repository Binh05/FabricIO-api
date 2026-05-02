using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork
{
    public interface IGameRepository : IRepository<Game>
    {
        Task<GamePaginationResult> GetPaginationGameAsync(Guid? userId, GetPaginationGameDto req, CancellationToken token);
        Task<IEnumerable<FeaturedGameRatingResponse>> GetTopGameRatingsAsync(int top, CancellationToken token);
    }
}
