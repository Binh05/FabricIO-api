using AutoMapper;
using FabricIO_api.Entities;
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
        var tokenExisting = await unitOfWork.Sessions.FindOneAsync(s => s.Token == token, cancellationToken);
        
        if (tokenExisting == null)
        {
            throw new Exception("Bạn chưa đăng nhập");
        }

        tokenExisting.IsReVoked = true;
        tokenExisting.UpdatedAt = DateTime.UtcNow;
        
        unitOfWork.Sessions.Update(tokenExisting);
        await unitOfWork.SaveAsync(cancellationToken);

        return tokenExisting;
    }
}