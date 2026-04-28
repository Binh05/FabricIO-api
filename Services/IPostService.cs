using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IPostService
{
    Task<PostResponseDto> CreatePostAsync(Guid userId, PostRequestDto request, CancellationToken token);
    Task<PostResponseDto> GetPostByIdAsync(Guid id, Guid? currentUserId, CancellationToken token);
    Task<PostPaginationResult> GetPostsAsync(PaginationDto pagination, Guid? currentUserId, CancellationToken token);
    Task<PostPaginationResult> GetPostsByUserIdAsync(Guid userId, PaginationDto pagination, Guid? currentUserId, CancellationToken token);
    Task<PostPaginationResult> GetTrendingPostsAsync(PaginationDto pagination, Guid? currentUserId, CancellationToken token);
    Task<PostResponseDto> UpdatePostAsync(Guid userId, Guid id, UpdatePostRequestDto request, CancellationToken token);
    Task DeletePostAsync(Guid userId, Guid id, CancellationToken token);
    Task DeletePostByAdminAsync(Guid id, CancellationToken token);
}
