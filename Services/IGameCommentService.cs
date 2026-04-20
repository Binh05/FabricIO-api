using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IGameCommentService
{
    Task<GameCommentPaginationResult> GetCommentsAsync(GameCommentPagination param, CancellationToken token);
    Task<GameCommentResponse> InsertCommentAsync(Guid userId, Guid gameId, string content, CancellationToken token);
}
