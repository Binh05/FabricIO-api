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
        var entity = await ctx.Set<T>().FindAsync(new object[] { id }, token);

        if (entity is null)
            return null;

        var entry = ctx.Entry(entity);
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
            ctx.Set<T>().Remove(entity);
        }

        return entity;
    }

    public async Task<IEnumerable<TOut>> GetAllAsync<TOut>(CancellationToken token)
    {
        return await ctx.Set<T>().ProjectTo<TOut>(mapper.ConfigurationProvider).ToListAsync(token);
    }

    public async Task<T?> GetEntityByIdAsync(Guid id, CancellationToken token)
    {
        return await ctx.Set<T>().FindAsync([id], token);
    }

    public async Task<TOut> GetByIdAsync<TOut>(Guid id, CancellationToken token)
    {
        var entity = await ctx.Set<T>().Where(e => EF.Property<Guid>(e, "Id") == id).ProjectTo<TOut>(mapper.ConfigurationProvider).FirstOrDefaultAsync(token);
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

    public async Task<TOut?> FindOneAsync<TOut>(Expression<Func<T, bool>> predicate, CancellationToken token)
    {
        return await ctx.Set<T>().Where(predicate).ProjectTo<TOut>(mapper.ConfigurationProvider).FirstOrDefaultAsync(token);
    }
}