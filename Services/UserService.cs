using AutoMapper;
using AutoMapper.QueryableExtensions;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.Services;

public class UserService(IUnitOfWork unitOfWork, IMapper mapper) : IUserService
{
    public async Task UpdateAvatarAsync(Guid userId, string avatarUrl, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetByIdAsync<User>(userId, token);

        if (user == null)
        {
            throw new Exception("User không tồn tại");
        }

        user.AvatarUrl = avatarUrl;

        unitOfWork.Users.Update(user);
        await unitOfWork.SaveAsync(token);
    }
    public async Task<UserResponse> GetByIdAsync(Guid userId, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetByIdAsync<UserResponse>(userId, token);

        if (user == null)
        {
            throw new Exception("User khong ton tai");
        }

        return user;
    }
}