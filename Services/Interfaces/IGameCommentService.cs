using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IGameCommentService
{
    Task<GameCommentPaginationResult> GetCommentsAsync(Guid gameId, PaginationDto param, CancellationToken token);
    Task<GameCommentResponse> InsertCommentAsync(Guid userId, Guid gameId, GameCommentDto req, CancellationToken token);
    Task<GameCommentResponse> ChangeCommentAsync(Guid userId, Guid commentId, GameCommentDto req, CancellationToken token);
    Task DeleteCommentAsync(Guid userId, UserRole role, Guid commentId, CancellationToken token);
}
