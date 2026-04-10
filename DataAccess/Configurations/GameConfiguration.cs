using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FabricIO_api.DataAccess;

public class GameConfiguration : IEntityTypeConfiguration<Game>
{
    public void Configure(EntityTypeBuilder<Game> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(g => g.GameType).HasConversion<string>();
        builder.Property(g => g.Price).HasColumnType("decimal(18,2)");
        builder.HasOne(g => g.Owner)
            .WithMany(u => u.Games)
            .HasForeignKey(g => g.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasQueryFilter(g => !g.IsDeleted);
    }
}