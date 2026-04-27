using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IPostService
{
    Task<PostResponseDto> CreatePostAsync(Guid userId, PostRequestDto request, CancellationToken token);
    Task<PostResponseDto> GetPostByIdAsync(Guid id, CancellationToken token);
    Task<PostPaginationResult> GetPostsAsync(PaginationDto pagination, CancellationToken token);
    Task<PostPaginationResult> GetPostsByUserIdAsync(Guid userId, PaginationDto pagination, CancellationToken token);
    Task<PostResponseDto> UpdatePostAsync(Guid userId, Guid id, UpdatePostRequestDto request, CancellationToken token);
    Task DeletePostAsync(Guid userId, Guid id, CancellationToken token);
}
