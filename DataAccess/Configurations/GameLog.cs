using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FabricIO_api.DataAccess;

public class GameLogConfiguration : IEntityTypeConfiguration<GamePlay>
{
    public void Configure(EntityTypeBuilder<GamePlay> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.HasOne(l => l.User)
            .WithMany(u => u.GamePlays)
            .HasForeignKey(l => l.UserId);
        builder.HasOne(l => l.Game)
            .WithMany(g => g.GamePlays)
            .HasForeignKey(l => l.GameId);
    }
}