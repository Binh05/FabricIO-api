using FabricIO_api.DTOs;
using FabricIO_api.UnitOfWork;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.Enums;

namespace FabricIO_api.Services;

public class PostReactionService(IUnitOfWork unitOfWork) : IPostReactionService
{
    public async Task CreateAsync(Guid userId, PostReactRequestDto request, CancellationToken token)
    {
        var existingReaction = await unitOfWork.PostReactions.GetEntityAsync(
            r => r.PostId == request.PostId && r.UserId == userId,
            token);

        if (existingReaction?.ReactionType == request.ReactionType)
            return;

        var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == request.PostId, token);
        if (post == null)
            throw new NotFoundException("Post not found.");

        if (existingReaction == null)
        {
            var reaction = new PostReaction
            {
                PostId = request.PostId,
                UserId = userId,
                ReactionType = request.ReactionType
            };

            ApplyCounterDelta(post, null, reaction.ReactionType);
            unitOfWork.PostReactions.Insert(reaction);
            unitOfWork.Posts.Update(post);
            await unitOfWork.SaveAsync(token);
            return;
        }

        var oldType = existingReaction.ReactionType;
        existingReaction.ReactionType = request.ReactionType;

        ApplyCounterDelta(post, oldType, existingReaction.ReactionType);
        unitOfWork.PostReactions.Update(existingReaction);
        unitOfWork.Posts.Update(post);
        await unitOfWork.SaveAsync(token);
    }

    public async Task DeleteAsync(Guid userId, Guid PostId, CancellationToken token)
    {
        var reaction = await unitOfWork.PostReactions.GetEntityAsync(r => r.PostId == PostId && r.UserId == userId, token);
        if (reaction == null)
            throw new NotFoundException("Post reaction not found.");

        if (reaction.ReactionType is ReactionType.Like or ReactionType.Dislike)
        {
            var post = await unitOfWork.Posts.GetEntityAsync(p => p.Id == reaction.PostId, token);
            if (post == null)
                throw new NotFoundException("Post not found.");

            if (reaction.ReactionType == ReactionType.Like)
                post.LikeCount = Math.Max(0, post.LikeCount - 1);
            else
                post.DislikeCount = Math.Max(0, post.DislikeCount - 1);

            unitOfWork.Posts.Update(post);
        }

        unitOfWork.PostReactions.Delete(reaction);
        await unitOfWork.SaveAsync(token);
    }

    private static void ApplyCounterDelta(Post post, ReactionType? oldType, ReactionType newType)
    {
        if (oldType.HasValue && oldType.Value == newType)
            return;

        if (oldType == ReactionType.Like)
            post.LikeCount = Math.Max(0, post.LikeCount - 1);
        else if (oldType == ReactionType.Dislike)
            post.DislikeCount = Math.Max(0, post.DislikeCount - 1);

        if (newType == ReactionType.Like)
            post.LikeCount++;
        else if (newType == ReactionType.Dislike)
            post.DislikeCount++;
    }
}
