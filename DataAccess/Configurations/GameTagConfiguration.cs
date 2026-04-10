using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FabricIO_api.DataAccess;

public class GameTagConfiguration : IEntityTypeConfiguration<GameTag>
{
    public void Configure(EntityTypeBuilder<GameTag> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.HasIndex(t => t.Name).IsUnique();
    }
}

public class GameTagMapConfiguration : IEntityTypeConfiguration<GameTagMap>
{
    public void Configure(EntityTypeBuilder<GameTagMap> builder)
    {
        builder.HasKey(m => new { m.GameId, m.TagId });
        builder.HasOne(m => m.Game)
            .WithMany(g => g.GameTagMaps)
            .HasForeignKey(m => m.GameId);
        builder.HasOne(m => m.Tag)
            .WithMany(t => t.GameTagMaps)
            .HasForeignKey(m => m.TagId);
    }
}