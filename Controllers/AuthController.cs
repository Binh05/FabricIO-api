using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthServices authServices) : ControllerBase
{
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