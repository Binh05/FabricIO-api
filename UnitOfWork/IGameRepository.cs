using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork
{
    public interface IGameRepository : IRepository<Game>
    {
        Task<IEnumerable<FeaturedGameRatingResponse>> GetTopGameRatingsAsync(int top, CancellationToken token);
    }
}
