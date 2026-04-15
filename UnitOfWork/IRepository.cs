using System.Linq.Expressions;

namespace FabricIO_api.UnitOfWork;

public interface IRepository<T>
{
    Task<TOut> GetByIdAsync<TOut>(Guid id, CancellationToken token);
    Task<IEnumerable<TOut>> GetAllAsync<TOut>(CancellationToken token);
    Task<IEnumerable<TOut>> GetListAsync<TOut>(Expression<Func<T, bool>> predicate, CancellationToken token);
    T Insert(T entity);
    T Update(T entity);
    Task<T?> DeleteAsync(Guid id, CancellationToken token);

    IEnumerable<T> InsertRange(IEnumerable<T> entities);
}