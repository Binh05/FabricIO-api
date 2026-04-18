using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IGameTagService
{
    Task<IEnumerable<GameTagResponse>> GetAllAsync(CancellationToken token);
    Task<IEnumerable<GameTag>> ValidTagsAsync(IEnumerable<Guid> tags, CancellationToken token);
    Task<GameTagResponse> InsertTagAsync(GameTagRequest tagName, CancellationToken token);
    Task<GameTagResponse> GetByIdAsync(Guid id, CancellationToken token);
}