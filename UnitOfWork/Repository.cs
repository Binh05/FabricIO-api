using System.Linq.Expressions;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using FabricIO_api.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.UnitOfWork;

public class Repository<T>(IMapper mapper, AppDbContext ctx) : IRepository<T> where T : class
{
    public async Task<T?> DeleteAsync(Guid id, CancellationToken token)
    {
        var entity = await ctx.Set<T>().FindAsync([id], token);
        if (entity is not null)
        {
            ctx.Set<T>().Remove(entity);
        }

        return entity;
    }

    public async Task<IEnumerable<TOut>> GetAllAsync<TOut>(CancellationToken token)
    {
        return await ctx.Set<T>().ProjectTo<TOut>(mapper.ConfigurationProvider).ToListAsync(token);
    }

    public async Task<TOut> GetByIdAsync<TOut>(Guid id, CancellationToken token)
    {
        var entity = await ctx.Set<T>().FindAsync([id], token);
        return mapper.Map<TOut>(entity);
    }

    public async Task<IEnumerable<TOut>> GetListAsync<TOut>(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        return await ctx.Set<T>().Where(predicate).ProjectTo<TOut>(mapper.ConfigurationProvider).ToListAsync(token);
    }

    public T Insert(T entity)
    {
        ctx.Add(entity);

        return entity;
    }

    public T Update(T entity)
    {
        ctx.Update(entity);
        return entity;
    }

    public IEnumerable<T> InsertRange(IEnumerable<T> entities)
    {
        ctx.AddRange(entities);
        return entities;
    }

    public async Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        return await ctx.Set<T>().FirstOrDefaultAsync(predicate, token);
    }
}