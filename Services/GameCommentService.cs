using AutoMapper;
using FabricIO_api.Middleware;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameCommentService(IUnitOfWork unitOfWork, IMapper mapper) : IGameCommentService
{
    public async Task<GameCommentPaginationResult> GetCommentsAsync(Guid gameId, PaginationDto param, CancellationToken token)
    {
        var gameComments = await unitOfWork.GameComments.GetPageCommentAsync(gameId, param, token);

        return gameComments;
    }

    public async Task<GameCommentResponse> InsertCommentAsync(Guid userId, Guid gameId, CreateGameComment req, CancellationToken token)
    {
        var gameExisting = await unitOfWork.Games.GetEntityAsync(g => g.Id == gameId, token);
        if (gameExisting == null)
        {
            throw new BadRequestException("Game không tồn tại");
        }

        var userExisting = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (userExisting == null)
        {
            throw new BadRequestException("User không tồn tại");
        }

        var entity = new GameComment
        {
            UserId = userId,
            GameId = gameId,
            Content = req.Content
        };

        unitOfWork.GameComments.Insert(entity);
        await unitOfWork.SaveAsync(token);

        var res = mapper.Map<GameCommentResponse>(entity);
        res.Commentator = mapper.Map<UserResponse>(userExisting);
        return res;
    }
}
