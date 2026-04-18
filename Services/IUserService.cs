using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IUserService
{
    Task UpdateAvatarAsync(Guid userId, string avatarUrl, CancellationToken token);
    Task<UserResponse> GetByIdAsync(Guid userId, CancellationToken token);
}