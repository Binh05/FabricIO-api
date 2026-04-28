using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork
{
    public interface IGamePlayRepository : IRepository<GamePlay>
    {
        Task<FeaturedGameResponse?> GetFeaturedGameAsync(CancellationToken token);
    }
}
