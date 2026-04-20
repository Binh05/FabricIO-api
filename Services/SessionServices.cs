using System.Linq.Expressions;
using AutoMapper;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class SessionService(IUnitOfWork unitOfWork) : ISessionServices
{
    public async Task<Session> InsertSessionAsync(string token, Guid userId, CancellationToken cancellationToken)
    {
        var entity = new Session
        {
            Token = token,
            UserId = userId
        };
        unitOfWork.Sessions.Insert(entity);
        await unitOfWork.SaveAsync(cancellationToken);

        return entity;
    }

    public async Task<Session> RevokeSessionAsync(string token, CancellationToken cancellationToken)
    {
        var tokenExisting = await unitOfWork.Sessions.GetEntityAsync(s => s.Token == token, cancellationToken);
        
        if (tokenExisting == null)
        {
            throw new UnauthorizedException("Bạn chưa đăng nhập");
        }

        tokenExisting.IsReVoked = true;
        tokenExisting.UpdatedAt = DateTime.UtcNow;
        
        await unitOfWork.SaveAsync(cancellationToken);

        return tokenExisting;
    }
    public async Task<Session> FindOneAsync(Expression<Func<Session, bool>> predicate, CancellationToken cancellationToken)
    {
        var session = await unitOfWork.Sessions.FindOneAsync<Session>(predicate, cancellationToken);

        if (session == null || session.IsReVoked || session.ExpiresAt < DateTime.UtcNow)
        {
            throw new ForbidException("Token không hợp lệ hoặc hết hạn");
        }

        return session;
    }
}