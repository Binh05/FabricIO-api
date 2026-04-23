using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync(UserRole role, CancellationToken token);
    Task<User> CheckUserExistingAsync(Guid userId, CancellationToken token);
    Task UpdateAvatarAsync(Guid userId, string avatarUrl, CancellationToken token);
    Task<UserResponse> GetByIdAsync(Guid userId, CancellationToken token);
    Task<UserResponse> UpdateProfileAsync(Guid userId, UpdateUserDto user, CancellationToken token);
    Task<string> BanUploadGame(Guid userId, UserRole adminRole, CancellationToken token);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto passwordDto, CancellationToken token);
    Task<IEnumerable<GameCardDto>> GetMyGameAsync(Guid userId, CancellationToken token);
    Task<IEnumerable<UserRatedResponse>> GetRatingsAsync(Guid userId, CancellationToken token);
    Task<IEnumerable<GameCardDto>> GetGamePaidAsync(Guid userId, CancellationToken token);
    Task<IEnumerable<GameCardDto>> GetGameFavoritesAsync(Guid userId, CancellationToken token);
}