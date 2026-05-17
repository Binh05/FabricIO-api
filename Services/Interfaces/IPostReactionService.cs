using FabricIO_api.DTOs;

public interface IPostReactionService
{
    Task CreateAsync(Guid userId, PostReactRequestDto request, CancellationToken token);
    Task DeleteAsync(Guid userId, Guid postId, CancellationToken token);
}