using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IGameCommentService
{
    Task<GameCommentPaginationResult> GetCommentsAsync(Guid gameId, PaginationDto param, CancellationToken token);
    Task<GameCommentResponse> InsertCommentAsync(Guid userId, Guid gameId, CreateGameComment req, CancellationToken token);
}
