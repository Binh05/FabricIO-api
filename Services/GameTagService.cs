using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameTagService(IUnitOfWork unitOfWork, IMapper mapper) : IGameTagService
{
    public async Task<IEnumerable<GameTagResponse>> GetAllAsync(CancellationToken token)
    {
        var entities = await unitOfWork.GameTags.GetAllAsync<GameTagResponse>(token);

        return entities;
    }

    public async Task<GameTagResponse> InsertTagAsync(GameTagRequest tagReq, CancellationToken token)
    {
        var tag = mapper.Map<GameTag>(tagReq);
        var entity = unitOfWork.GameTags.Insert(tag);
        await unitOfWork.SaveAsync(token);


        return mapper.Map<GameTagResponse>(entity);
    }

    public async Task<GameTagResponse> GetByIdAsync(Guid id, CancellationToken token)
    {
        var entity = await unitOfWork.GameTags.GetByIdAsync<GameTagResponse>(id, token);

        return entity;
    }
}
