using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class PostCommentService(IUnitOfWork unitOfWork, IMapper mapper) : IPostCommentService
{
    public async Task<PostCommentPaginationResult> GetCommentsAsync(Guid postId, PaginationDto pagination, CancellationToken token)
    {
        var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == postId, token);
        if (post == null)
            throw new NotFoundException("Post is not exist");

        var comments = (await unitOfWork.PostComments.GetEntitiesAsync(c => c.PostId == postId && !c.IsDeleted, token))
            .OrderByDescending(c => c.CreatedAt)
            .ToList();

        var userIds = comments.Select(c => c.UserId).Distinct().ToList();
        var users = userIds.Count == 0
            ? []
            : await unitOfWork.Users.GetListAsync<UserDisplay>(u => userIds.Contains(u.Id), token);
        var userMap = users
            .Where(u => u.Id.HasValue)
            .ToDictionary(u => u.Id!.Value);

        var items = comments.Select(comment =>
        {
            if (!userMap.TryGetValue(comment.UserId, out var commentator))
            {
                throw new NotFoundException("User is not exist");
            }

            return new PostCommentResponse
            {
                Id = comment.Id,
                PostId = comment.PostId,
                Commentator = commentator,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt
            };
        }).ToList();

        var page = pagination.Page < 1 ? 1 : pagination.Page;
        var pageSize = pagination.PageSize < 1 ? 20 : pagination.PageSize;
        var pagedItems = items
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PostCommentPaginationResult
        {
            Total = items.Count,
            Page = page,
            PageSize = pageSize,
            Items = pagedItems
        };
    }

    public async Task<PostCommentResponse> InsertCommentAsync(Guid userId, Guid postId, PostCommentDto request, CancellationToken token)
    {
        var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == postId, token);
        if (post == null)
            throw new NotFoundException("Post is not exist");

        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (user == null)
            throw new NotFoundException("User is not exist");

        var comment = new PostComment
        {
            PostId = postId,
            UserId = userId,
            Content = request.Content
        };

        unitOfWork.PostComments.Insert(comment);
        post.CommentCount++;
        unitOfWork.Posts.Update(post);
        await unitOfWork.SaveAsync(token);

        return new PostCommentResponse
        {
            Id = comment.Id,
            PostId = comment.PostId,
            Commentator = mapper.Map<UserDisplay>(user),
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }

    public async Task<PostCommentResponse> UpdateCommentAsync(Guid userId, Guid commentId, PostCommentDto request, CancellationToken token)
    {
        var comment = await unitOfWork.PostComments.GetEntityAsync(c => c.Id == commentId && !c.IsDeleted, token);
        if (comment == null)
            throw new NotFoundException("Comment is not exist");

        if (comment.UserId != userId)
            throw new UnauthorizedException("Unauthorized to update this comment");

        var commentator = await unitOfWork.Users.FindOneAsync<UserDisplay>(u => u.Id == userId, token);
        if (commentator == null)
            throw new NotFoundException("User is not exist");

        comment.Content = request.Content;
        unitOfWork.PostComments.Update(comment);
        await unitOfWork.SaveAsync(token);

        return new PostCommentResponse
        {
            Id = comment.Id,
            PostId = comment.PostId,
            Commentator = commentator,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
        };
    }

    public async Task DeleteCommentAsync(Guid userId, UserRole role, Guid commentId, CancellationToken token)
    {
        var comment = await unitOfWork.PostComments.GetEntityAsync(c => c.Id == commentId && !c.IsDeleted, token);
        if (comment == null)
            throw new NotFoundException("Comment is not exist");

        if (comment.UserId != userId && role != UserRole.Admin)
            throw new UnauthorizedException("Unauthorized to delete this comment");

        var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == comment.PostId, token);
        if (post == null)
            throw new NotFoundException("Post is not exist");

        unitOfWork.PostComments.Delete(comment);
        if (post.CommentCount > 0)
            post.CommentCount--;
        unitOfWork.Posts.Update(post);
        await unitOfWork.SaveAsync(token);
    }
}
