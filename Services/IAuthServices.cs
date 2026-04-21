using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using Microsoft.Extensions.Options;

namespace FabricIO_api.Services;

public interface IAuthServices
{
    string GenerateJwtToken(Guid userId, UserRole role);
    string GenerateRefreshToken();
    Task<UserResponse> RegisterAsync(UserRegister userInfo, CancellationToken token);
    Task<(string AccessToken, string RefreshToken, Guid UserId)?> LoginAsync(UserLogin user, CancellationToken token);
}