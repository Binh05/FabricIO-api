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
    [HttpGet]
    public async Task<ActionResult<UserResponse>> FetchMeAsync(CancellationToken token)
    {
        var userId = User.GetUserId();

        var user = await userService.GetByIdAsync(userId, token);

        return Ok(user);
    }

    [HttpGet("ratings")]
    public async Task<ActionResult<IEnumerable<UserRatedResponse>>> GetRatedAsync(CancellationToken token)
    {
        var userId = User.GetUserId();

        var res = await userService.GetRatingsAsync(userId, token);

        return Ok(res);
    }
    
    [HttpPatch("profile")]
    public async Task<ActionResult<UserResponse>> UpdateProfileAsync(UpdateUserDto req, CancellationToken token)
    {
        var userId = User.GetUserId();

        var res = await userService.UpdateProfileAsync(userId, req, token);

        return Ok(res);
    }

    [HttpPatch("avatar")]
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

    [HttpPatch("password")]
    public async Task<ActionResult> ChangePasswordAsync(ChangePasswordDto passwordDto, CancellationToken token)
    {
        var userId = User.GetUserId();

        await userService.ChangePasswordAsync(userId, passwordDto, token);

        return Ok(new { message = "Đổi mật khẩu thành công" });
    }
}