using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork
{
    public interface IGameCommentRepository : IRepository<GameComment>
    {
        Task<GameCommentPaginationResult> GetPageCommentAsync(Guid gameId, PaginationDto req, CancellationToken token);
    }
}
