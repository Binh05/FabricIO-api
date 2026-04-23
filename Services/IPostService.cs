using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IPostService
{
    Task<PostResponseDto> CreatePostAsync(Guid userId, PostRequestDto request, CancellationToken token);
    Task<PostResponseDto> GetPostByIdAsync(Guid id, CancellationToken token);
    Task<IEnumerable<PostResponseDto>> GetPostsAsync(CancellationToken token);
    Task<IEnumerable<PostResponseDto>> GetPostsByUserIdAsync(Guid userId, CancellationToken token);
    Task<PostResponseDto> UpdatePostAsync(Guid userId, Guid id, PostRequestDto request, CancellationToken token);
    Task DeletePostAsync(Guid userId, Guid id, CancellationToken token);
}
