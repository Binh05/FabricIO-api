using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FabricIO_api.DataAccess;

public class GameCommentConfiguration : IEntityTypeConfiguration<GameComment>
{
    public void Configure(EntityTypeBuilder<GameComment> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.HasOne(c => c.User)
            .WithMany(u => u.GameComments)
            .HasForeignKey(c => c.UserId);
        builder.HasOne(c => c.Game)
            .WithMany(g => g.GameComments)
            .HasForeignKey(c => c.GameId);
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}

public class GameRatingConfiguration : IEntityTypeConfiguration<GameRating>
{
    public void Configure(EntityTypeBuilder<GameRating> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.HasIndex(r => new { r.UserId, r.GameId }).IsUnique();
        builder.ToTable(t => t.HasCheckConstraint("CK_GameRating_Stars", "\"Stars\" BETWEEN 1 AND 5"));
        builder.HasOne(r => r.User)
            .WithMany(u => u.GameRatings)
            .HasForeignKey(r => r.UserId);
        builder.HasOne(r => r.Game)
            .WithMany(g => g.GameRatings)
            .HasForeignKey(r => r.GameId);
    }
}

public class GameFavoriteConfiguration : IEntityTypeConfiguration<GameFavorite>
{
    public void Configure(EntityTypeBuilder<GameFavorite> builder)
    {
        builder.HasKey(f => new { f.GameId, f.UserId });
        builder.HasOne(f => f.User)
            .WithMany(u => u.GameFavorites)
            .HasForeignKey(f => f.UserId);
        builder.HasOne(f => f.Game)
            .WithMany(g => g.GameFavorites)
            .HasForeignKey(f => f.GameId);
    }
}

public class GamePurchaseConfiguration : IEntityTypeConfiguration<GamePurchase>
{
    public void Configure(EntityTypeBuilder<GamePurchase> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(p => p.AmountPaid).HasColumnType("decimal(18,2)");
        builder.HasOne(p => p.Buyer)
            .WithMany(u => u.GamePurchases)
            .HasForeignKey(p => p.Id);
        builder.HasOne(p => p.Game)
            .WithMany(g => g.GamePurchases)
            .HasForeignKey(p => p.GameId);
    }
}