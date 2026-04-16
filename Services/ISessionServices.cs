using System.Linq.Expressions;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface ISessionServices
{
    Task<Session> RevokeSessionAsync(string token, CancellationToken cancellationToken);
    Task<Session> InsertSessionAsync(string token, Guid userId, CancellationToken cancellationToken);
    Task<Session> FindOneAsync(Expression<Func<Session, bool>> predicate, CancellationToken cancellationToken);
}