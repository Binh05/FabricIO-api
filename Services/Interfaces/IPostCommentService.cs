using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IPostCommentService
{
    Task<PostCommentPaginationResult> GetCommentsAsync(Guid postId, PaginationDto pagination, CancellationToken token);
    Task<PostCommentResponse> InsertCommentAsync(Guid userId, Guid postId, PostCommentDto request, CancellationToken token);
    Task<PostCommentResponse> UpdateCommentAsync(Guid userId, Guid commentId, PostCommentDto request, CancellationToken token);
    Task DeleteCommentAsync(Guid userId, UserRole role, Guid commentId, CancellationToken token);
}
