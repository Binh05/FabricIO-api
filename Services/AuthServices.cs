using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FabricIO_api.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FabricIO_api.Services;

public class AuthServices : IAuthServices
{
    private readonly AppSetting appSetting;
    public AuthServices(IOptionsMonitor<AppSetting> optionsMonitor)
    {
        appSetting = optionsMonitor.CurrentValue;
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
}