using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService, IStorageServices storageServices) : ControllerBase
{
    [HttpPost("avatar")]
    public async Task<ActionResult<string>> UploadAvatarAsync(IFormFile file, CancellationToken token)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Ảnh không hợp lệ");
        }
        var userId = User.GetUserId();
        
        var url = await storageServices.UploadAsync(file, token);

        await userService.UpdateAvatarAsync(userId, url, token);

        return Ok(new { avatarUrl = url });
    }

    [HttpGet]
    public async Task<ActionResult<UserResponse>> GetUserAsync(CancellationToken token)
    {
        var userId = User.GetUserId();

        var user = await userService.GetByIdAsync(userId, token);

        return Ok(user);
    }
}