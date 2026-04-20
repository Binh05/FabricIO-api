using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameCommentService(IUnitOfWork unitOfWork, IMapper mapper) : IGameCommentService
{
    public async Task<GameCommentPaginationResult> GetCommentsAsync(GameCommentPagination param, CancellationToken token)
    {
        var gameComments = await unitOfWork.GameComments.GetPageCommentAsync(param, token);

        return gameComments;
    }

    public async Task<GameCommentResponse> InsertCommentAsync(Guid userId, Guid gameId, string content, CancellationToken token)
    {
        var entity = new GameComment
        {
            UserId = userId,
            GameId = gameId,
            Content = content
        };

        unitOfWork.GameComments.Insert(entity);
        await unitOfWork.SaveAsync(token);

        return mapper.Map<GameCommentResponse>(entity);
    }
}
