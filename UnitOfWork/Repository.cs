using System.Linq.Expressions;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using FabricIO_api.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.UnitOfWork;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly IMapper mapper;
    protected readonly AppDbContext dbContext;
    public Repository(IMapper m, AppDbContext ctx)
    {
        mapper = m;
        dbContext = ctx;
    }
    public T Delete(T entity)
    {
        var entry = dbContext.Entry(entity);
        var prop = entry.Metadata.FindProperty("IsDeleted");

        if (prop != null)
        {
            var isDeleted = (bool)entry.Property("IsDeleted").CurrentValue!;

            if (!isDeleted)
            {
                entry.Property("IsDeleted").CurrentValue = true;
            }
        }
        else
        {
            dbContext.Set<T>().Remove(entity);
        }

        return entity;
    }

    public async Task<IEnumerable<TOut>> GetAllAsync<TOut>(CancellationToken token)
    {
        return await dbContext.Set<T>().ProjectTo<TOut>(mapper.ConfigurationProvider).ToListAsync(token);
    }

    public async Task<T?> GetEntityAsync(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        return await dbContext.Set<T>().FirstOrDefaultAsync(predicate, token);
    }

    public async Task<IEnumerable<T>> GetEntitiesAsync(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        return await dbContext.Set<T>().Where(predicate).ToListAsync(token);
    }

    public async Task<TOut> GetByIdAsync<TOut>(Guid id, CancellationToken token)
    {
        var entity = await dbContext.Set<T>().Where(e => EF.Property<Guid>(e, "Id") == id).ProjectTo<TOut>(mapper.ConfigurationProvider).FirstOrDefaultAsync(token);
        return mapper.Map<TOut>(entity);
    }

    public async Task<IEnumerable<TOut>> GetListAsync<TOut>(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        return await dbContext.Set<T>().Where(predicate).ProjectTo<TOut>(mapper.ConfigurationProvider).ToListAsync(token);
    }

    public T Insert(T entity)
    {
        dbContext.Add(entity);

        return entity;
    }

    public T Update(T entity)
    {
        dbContext.Update(entity);
        return entity;
    }

    public IEnumerable<T> InsertRange(IEnumerable<T> entities)
    {
        dbContext.AddRange(entities);
        return entities;
    }

    public async Task<TOut?> FindOneAsync<TOut>(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        return await dbContext.Set<T>().Where(predicate).ProjectTo<TOut>(mapper.ConfigurationProvider).FirstOrDefaultAsync(token);
    }
}
