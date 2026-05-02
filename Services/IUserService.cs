using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllAsync(UserRole role, CancellationToken token);
    Task<User> CheckUserExistingAsync(Guid userId, CancellationToken token);
    Task<string> UpdateAvatarAsync(Guid userId, IFormFile imgFile, CancellationToken token);
    Task<UserResponse> GetByIdAsync(Guid userId, CancellationToken token);
    Task<UserResponse> UpdateProfileAsync(Guid userId, UpdateUserDto user, CancellationToken token);
    Task<string> UpdateGameBannedAsync(Guid userId, bool isGameBanned, UserRole adminRole, CancellationToken token);
    Task<string> UpdateBannedAsync(Guid userId, bool isBanned, DateTime? banExpiresAt, UserRole adminRole, CancellationToken token);
    Task<string> UpdatePostBannedAsync(Guid userId, bool isPostBanned, UserRole adminRole, CancellationToken token);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto passwordDto, CancellationToken token);
    Task<IEnumerable<GameResponseDto>> GetMyGameAsync(Guid userId, CancellationToken token);
    Task<IEnumerable<UserRatedResponse>> GetRatingsAsync(Guid userId, CancellationToken token);
    Task<IEnumerable<GameResponseDto>> GetGamePaidAsync(Guid userId, CancellationToken token);
    Task<IEnumerable<GameResponseDto>> GetGameFavoritesAsync(Guid userId, CancellationToken token);
}