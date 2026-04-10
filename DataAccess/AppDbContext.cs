using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.DataAccess;

public class AppDbContext: DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<GameTagMap> GameTagMaps { get; set; }
    public DbSet<GameTag> GameTags { get; set; }
    public DbSet<GameComment> GameComments { get; set; }
    public DbSet<GamePurchase> GamePurchases { get; set; }
    public DbSet<GameFavorite> GameFavorites { get; set; }
    public DbSet<GameRating> GameRatings { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<PostComment> PostComments { get; set; }
    public DbSet<PostReaction> PostReactions { get; set; }
    public DbSet<Follow> Follows { get; set; }
    public DbSet<Block> Blocks { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
            e.Property(u => u.Balance).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Game>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(g => g.GameType).HasConversion<string>();
            e.Property(g => g.Price).HasColumnType("decimal(18,2)");
            e.HasOne(g => g.Owner)
             .WithMany(u => u.Games)
             .HasForeignKey(g => g.OwnerId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(g => !g.IsDeleted);
        });

        modelBuilder.Entity<GameTagMap>(e =>
        {
            e.HasKey(m => new { m.GameId, m.TagId });
            e.HasOne(m => m.Game)
             .WithMany(g => g.GameTagMaps)
             .HasForeignKey(m => m.GameId);
            e.HasOne(m => m.Tag)
             .WithMany(t => t.GameTagMaps)
             .HasForeignKey(m => m.TagId);
        });

        modelBuilder.Entity<GameTag>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(t => t.Name).IsUnique();
        });

        modelBuilder.Entity<GameComment>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(c => c.User)
             .WithMany(u => u.GameComments)
             .HasForeignKey(c => c.UserId);
            e.HasOne(c => c.Game)
             .WithMany(g => g.GameComments)
             .HasForeignKey(c => c.GameId);
        });

        modelBuilder.Entity<GamePurchase>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(p => p.AmountPaid).HasColumnType("decimal(18,2)");
            e.HasOne(p => p.Buyer)
             .WithMany(u => u.GamePurchases)
             .HasForeignKey(p => p.Id);
            e.HasOne(p => p.Game)
             .WithMany(g => g.GamePurchases)
             .HasForeignKey(p => p.GameId);
        });

        modelBuilder.Entity<GameFavorite>(e =>
        {
            e.HasKey(f => new { f.GameId, f.UserId });
            e.HasOne(f => f.User)
             .WithMany(u => u.GameFavorites)
             .HasForeignKey(f => f.UserId);
            e.HasOne(f => f.Game)
             .WithMany(g => g.GameFavorites)
             .HasForeignKey(f => f.GameId);
        });

        modelBuilder.Entity<GameRating>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(r => new { r.UserId, r.GameId }).IsUnique();
            e.ToTable(t => t.HasCheckConstraint("CK_GameRating_Stars", "\"Stars\" BETWEEN 1 AND 5"));
            e.HasOne(r => r.User)
             .WithMany(u => u.GameRatings)
             .HasForeignKey(r => r.UserId);
            e.HasOne(r => r.Game)
             .WithMany(g => g.GameRatings)
             .HasForeignKey(r => r.GameId);
        });

        modelBuilder.Entity<Post>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(p => p.Author)
             .WithMany(u => u.Posts)
             .HasForeignKey(p => p.AuthorId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(p => !p.IsDeleted);
        });

        modelBuilder.Entity<PostComment>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(c => c.User)
             .WithMany(u => u.PostComments)
             .HasForeignKey(c => c.UserId);
            e.HasOne(c => c.Post)
             .WithMany(p => p.Comments)
             .HasForeignKey(c => c.PostId);
        });

        modelBuilder.Entity<PostReaction>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(r => new { r.PostId, r.UserId }).IsUnique();
            e.Property(r => r.ReactionType).HasConversion<string>();
            e.HasOne(r => r.User)
             .WithMany(u => u.PostReactions)
             .HasForeignKey(r => r.UserId);
            e.HasOne(r => r.Post)
             .WithMany(p => p.Reactions)
             .HasForeignKey(r => r.PostId);
        });

        modelBuilder.Entity<Follow>(e =>
        {
            e.HasKey(f => new { f.FollowerId, f.FollowingId});
            e.HasOne(f => f.Follower)
             .WithMany(u => u.Followers)
             .HasForeignKey(f => f.FollowerId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(f => f.Following)
             .WithMany(u => u.Followings)
             .HasForeignKey(f => f.FollowingId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Block>(e =>
        {
            e.HasKey(b => new { b.BlockerId, b.BlockedId });
            e.HasOne(b => b.Blocker)
             .WithMany(u => u.Blockers)
             .HasForeignKey(b => b.BlockerId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.Blocked)
             .WithMany(u => u.Blockeds)
             .HasForeignKey(b => b.BlockedId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Notification>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(n => n.Type).HasConversion<string>();
            e.HasIndex(n => new { n.RecipientId, n.IsRead });
            e.HasOne(n => n.Recipient)
             .WithMany(u => u.Notifications)
             .HasForeignKey(n => n.RecipientId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(n => n.Sender)
             .WithMany()
             .HasForeignKey(n => n.SenderId)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }
}