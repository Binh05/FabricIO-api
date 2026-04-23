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

    public async Task<GameCommentResponse> InsertCommentAsync(Guid userId, Guid gameId, GameCommentDto req, CancellationToken token)
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
        res.Commentator = mapper.Map<UserDisplay>(userExisting);
        return res;
    }

    public async Task<GameCommentResponse> ChangeCommentAsync(Guid userId, Guid commentId, GameCommentDto req, CancellationToken token)
    {
        var commentExisting = await unitOfWork.GameComments.GetEntityAsync(c => c.Id == commentId, token);

        if (commentExisting == null)
        {
            throw new NotFoundException("Không tìm thấy comment");
        }

        if (commentExisting.UserId != userId)
        {
            throw new UnauthorizedException("Không có quyền sửa comment của người khác");
        }

        commentExisting.Content = req.Content;
        commentExisting.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveAsync(token);

        return mapper.Map<GameCommentResponse>(commentExisting);
    }

    public async Task DeleteCommentAsync(Guid userId, UserRole role, Guid commentId, CancellationToken token)
    {
        var comment = await unitOfWork.GameComments.GetEntityAsync(c => c.Id == commentId, token);

        if (comment == null)
        {
            throw new NotFoundException("Comment không tồn tại");
        }

        if (comment.UserId != userId && role != UserRole.Admin)
        {
            throw new UnauthorizedException("Không có quyền xóa comment");
        }

        unitOfWork.GameComments.Delete(comment);
        await unitOfWork.SaveAsync(token);
    }
}
