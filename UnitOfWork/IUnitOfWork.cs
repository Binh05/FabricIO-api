using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork;

public interface IUnitOfWork
{
    public IRepository<User> Users { get; }
    public IGameRepository Games { get; }
    public IRepository<Session> Sessions { get; }
    public IRepository<GameTag> GameTags { get; }
    public IRepository<GameTagMap> GameTagMaps { get; }
    public IRepository<GameFavorite> GameFavorites { get; }
    public IRepository<Post> Posts { get; }
    public IRepository<PostComment> PostComments { get; }
    public IRepository<PostMedia> PostMedias { get; }
    public IRepository<PostReaction> PostReactions { get; }
    public IGameCommentRepository GameComments { get; }
    public IGameRatingRepository GameRatings { get; }
    public IRepository<GamePurchase> GamePurchases { get; }
    public IGamePlayRepository GamePlays { get; }
    public Task SaveAsync(CancellationToken token);
}
