using AutoMapper;
using FabricIO_api.DataAccess;
using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork;

public class UnitOfWork(IMapper mapper, AppDbContext ctx) : IUnitOfWork
{
    private readonly IRepository<User> users = new Repository<User>(mapper, ctx);
    public IRepository<User> Users => users;

    private readonly IRepository<Game> games = new Repository<Game>(mapper, ctx);
    public IRepository<Game> Games => games;

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

    private readonly IRepository<PostMedia> postMedias = new Repository<PostMedia>(mapper, ctx);
    public IRepository<PostMedia> PostMedias => postMedias;

    public async Task SaveAsync(CancellationToken token)
    {
        await ctx.SaveChangesAsync(token);
    }
}