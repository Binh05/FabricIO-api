using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.DataAccess;

public class AppDbContext: DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<GamePlay> GameLogs { get; set; }
    public DbSet<GameTagMap> GameTagMaps { get; set; }
    public DbSet<GameTag> GameTags { get; set; }
    public DbSet<GameComment> GameComments { get; set; }
    public DbSet<GamePurchase> GamePurchases { get; set; }
    public DbSet<GameFavorite> GameFavorites { get; set; }
    public DbSet<GameRating> GameRatings { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<PostComment> PostComments { get; set; }
    public DbSet<PostReaction> PostReactions { get; set; }
    public DbSet<PostMedia> PostMedias { get; set; }
    public DbSet<Follow> Follows { get; set; }
    public DbSet<Block> Blocks { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Session> Sessions { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}