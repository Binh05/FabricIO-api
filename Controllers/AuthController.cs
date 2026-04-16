using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthServices authServices, ISessionServices sessionServices) : ControllerBase
{
    [HttpPost("register")]
    public async Task<UserResponse> RegisterAsync(UserRegister user, CancellationToken token)
    {
        var entity = await authServices.RegisterAsync(user, token);

        return entity;
    }

    [HttpPost("login")]
    public async Task<ActionResult<string>> LoginAsync(UserLogin user, CancellationToken cancellationToken)
    {
        var secureToken = await authServices.LoginAsync(user, cancellationToken);

        var refreshToken = secureToken.Value.RefreshToken;

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(7)
        });

        await sessionServices.InsertSessionAsync(refreshToken, secureToken.Value.UserId, cancellationToken);

        return Ok(new { AccessToken = secureToken.Value.AccessToken });
    }

    [Authorize]
    [HttpPost("signout")]
    public async Task<ActionResult> SignOut(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null)
        {
            return BadRequest("Bạn chưa đăng nhập");
        }

        await sessionServices.RevokeSessionAsync(refreshToken, cancellationToken);
        return NoContent();
    }

    [HttpGet]
    public async Task<string> GetToken(Guid userId)
    {
        return authServices.GenerateJwtToken(userId);
    }
    
    [Authorize]
    [HttpGet("id")]
    public async Task<Guid> GetIdFromTokenAsync()
    {
        return User.GetUserId();
    }
}