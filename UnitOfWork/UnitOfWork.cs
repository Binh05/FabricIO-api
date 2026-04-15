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
    public async Task SaveAsync(CancellationToken token)
    {
        await ctx.SaveChangesAsync(token);
    }
}