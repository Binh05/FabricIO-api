using AutoMapper;
using FabricIO_api.DataAccess;
using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace FabricIO_api.UnitOfWork;

public class UnitOfWork(IMapper mapper, AppDbContext ctx) : IUnitOfWork
{
    private readonly IRepository<User> users = new Repository<User>(mapper, ctx);
    public IRepository<User> Users => users;

    private readonly IGameRepository games = new GameRepository(mapper, ctx);
    public IGameRepository Games => games;

    private readonly IRepository<Session> sessions = new Repository<Session>(mapper, ctx);
    public IRepository<Session> Sessions => sessions;

    private readonly IRepository<GameTag> gameTags = new Repository<GameTag>(mapper, ctx);
    public IRepository<GameTag> GameTags => gameTags;

    private readonly IRepository<GameTagMap> gameTagMaps = new Repository<GameTagMap>(mapper, ctx);
    public IRepository<GameTagMap> GameTagMaps => gameTagMaps;

    private readonly IRepository<GameFavorite> gameFavorites = new Repository<GameFavorite>(mapper, ctx);
    public IRepository<GameFavorite> GameFavorites => gameFavorites;

    private readonly IRepository<Post> posts = new Repository<Post>(mapper, ctx);
    public IRepository<Post> Posts => posts;

    private readonly IRepository<PostComment> postComments = new Repository<PostComment>(mapper, ctx);
    public IRepository<PostComment> PostComments => postComments;

    private readonly IRepository<PostMedia> postMedias = new Repository<PostMedia>(mapper, ctx);
    public IRepository<PostMedia> PostMedias => postMedias;

    private readonly IRepository<PostReaction> postReactions = new Repository<PostReaction>(mapper, ctx);
    public IRepository<PostReaction> PostReactions => postReactions;

    private readonly IGameCommentRepository gameComments = new GameCommentRepository(mapper, ctx);
    public IGameCommentRepository GameComments => gameComments;

    private readonly IGameRatingRepository gameRatings = new GameRatingRepository(mapper, ctx);
    public IGameRatingRepository GameRatings => gameRatings;

    private readonly IRepository<GamePurchase> gamePurchases = new Repository<GamePurchase>(mapper, ctx);
    public IRepository<GamePurchase> GamePurchases => gamePurchases;

    private readonly IGamePlayRepository gamePlays = new GamePlayRepository(mapper, ctx);
    public IGamePlayRepository GamePlays => gamePlays;

    private IDbContextTransaction transaction;
    public async Task SaveAsync(CancellationToken token)
    {
        await ctx.SaveChangesAsync(token);
    }

    public async Task BeginTransactionAsync(CancellationToken token)
    {
        transaction = await ctx.Database.BeginTransactionAsync(token);
    }

    public async Task CommitAsync(CancellationToken token)
    {
        await ctx.SaveChangesAsync(token);
        await transaction.CommitAsync(token);
    }

    public async Task RollBackAsync(CancellationToken token)
    {
        await transaction.RollbackAsync(token);
    }
}
