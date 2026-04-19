using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class UserService(IUnitOfWork unitOfWork) : IUserService
{
    public async Task UpdateAvatarAsync(Guid userId, string avatarUrl, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetByIdAsync<User>(userId, token);

        if (user == null)
        {
            throw new NotFoundException("User không tồn tại");
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
            throw new NotFoundException("User khong ton tai");
        }

        return user;
    }
}