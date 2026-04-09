using FabricIO_api.Entities;

namespace FabricIO_api.UnitOfWork;

public interface IUnitOfWork
{
    public IRepository<User> Users { get; }
    public Task SaveAsync(CancellationToken token);
}