using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FabricIO_api.Services;

public class AuthServices(IOptionsMonitor<AppSetting> optionsMonitor, IMapper mapper, IUnitOfWork unitOfWork) : IAuthServices
{
    private readonly AppSetting appSetting = optionsMonitor.CurrentValue;
    public async Task<UserResponse> RegisterAsync(UserRegister userInfo, CancellationToken token)
    {
        var usernameExisting = await unitOfWork.Users.FindOneAsync(u => u.Username == userInfo.Username, token);
        if (usernameExisting is not null)
        {
            throw new Exception("Username đã tồn tại");
        }

        var entity = mapper.Map<User>(userInfo);
        entity.HashedPassword = BCrypt.Net.BCrypt.HashPassword(entity.HashedPassword);

        unitOfWork.Users.Insert(entity);

        await unitOfWork.SaveAsync(token);

        return mapper.Map<UserResponse>(entity);
    }
    public async Task<(string AccessToken, string RefreshToken, Guid UserId)?> LoginAsync(UserLogin user, CancellationToken token)
    {
        var userExisting = await unitOfWork.Users.FindOneAsync(u => u.Username == user.Username, token);
        if (userExisting == null || 
            !BCrypt.Net.BCrypt.Verify(user.Password, userExisting.HashedPassword))
        {
            throw new Exception("Sai username hoặc password");
        }

        var refreshToken = GenerateRefreshToken();
        var accessToken = GenerateJwtToken(userExisting.Id);

        return (accessToken, refreshToken, userExisting.Id);
    }
    public string GenerateJwtToken(Guid userId)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSetting.SecretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }
}