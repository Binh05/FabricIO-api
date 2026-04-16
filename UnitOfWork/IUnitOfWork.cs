using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork;

public interface IUnitOfWork
{
    public IRepository<User> Users { get; }
    public IRepository<Game> Games { get; }
    public IRepository<Session> Sessions { get; }
    public Task SaveAsync(CancellationToken token);
}