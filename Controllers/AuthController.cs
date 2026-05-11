using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthServices authServices, ISessionServices sessionServices) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> RegisterAsync(UserRegister user, CancellationToken token)
    {
        var entity = await authServices.RegisterAsync(user, token);

        return Ok(new {
            message = "Đăng ký thành công",
            entity 
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult> LoginAsync(UserLogin user, CancellationToken cancellationToken)
    {
        var secureToken = await authServices.LoginAsync(user, cancellationToken);

        var jwtToken = secureToken.Value.AccessToken;

        Response.Cookies.Append("token", jwtToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
        });

        await sessionServices.InsertSessionAsync(jwtToken, secureToken.Value.UserId, cancellationToken);

        return Ok(new { message = "Đăng nhập thành công" });
    }

    [HttpPost("signout")]
    public async Task<ActionResult> SignOut(CancellationToken cancellationToken)
    {
        var sessionToken = Request.Cookies["token"];
        if (sessionToken != null)
        {
            await sessionServices.RevokeSessionAsync(sessionToken, cancellationToken);
        }

        Response.Cookies.Delete("token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });
        
        return NoContent();
    }

    // [HttpGet("refresh")]
    // public async Task<ActionResult<string>> RefreshTokenAsync(CancellationToken cancellationToken)
    // {
    //     var refreshToken = Request.Cookies["refreshToken"];
    //     if (refreshToken == null)
    //     {
    //         return Unauthorized();
    //     }

    //     var session = await sessionServices.FindOneAsync(s => s.Token == refreshToken, cancellationToken);

    //     var token = authServices.GenerateJwtToken(session.UserId);

    //     return Ok(new { accessToken = token });
    // }
}