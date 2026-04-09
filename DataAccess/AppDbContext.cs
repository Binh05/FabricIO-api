using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.DataAccess;

public class AppDbContext: DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users { get; set; }
}