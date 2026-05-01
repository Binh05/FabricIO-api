using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAllAsync(CancellationToken token)
    {
        var role = User.GetRole();

        var data = await userService.GetAllAsync(role, token);

        return Ok(data);
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserResponse>> GetUserById([FromRoute] Guid userId, CancellationToken token)
    {
        var res = await userService.GetByIdAsync(userId, token);

        return Ok(res);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> FetchMeAsync(CancellationToken token)
    {
        var userId = User.GetUserId();

        var user = await userService.GetByIdAsync(userId, token);

        return Ok(user);
    }

    [HttpGet("mygame")]
    public async Task<ActionResult<IEnumerable<GameCardDto>>> GetMyGameAsync(CancellationToken token)
    {
        var userId = User.GetUserId();

        var data = await userService.GetMyGameAsync(userId, token);

        return Ok(data);
    }

    [HttpGet("ratings")]
    public async Task<ActionResult<IEnumerable<UserRatedResponse>>> GetRatedAsync(CancellationToken token)
    {
        var userId = User.GetUserId();

        var res = await userService.GetRatingsAsync(userId, token);

        return Ok(res);
    }

    [HttpGet("gamepaid")]
    public async Task<ActionResult<IEnumerable<GameCardDto>>> GetGamePaidAsync(CancellationToken token)
    {
        var userId = User.GetUserId();

        var data = await userService.GetGamePaidAsync(userId, token);

        return Ok(data);
    }

    [HttpGet("gamefavorite")]
    public async Task<ActionResult<IEnumerable<GameCardDto>>> GetGameFavoriteAsync(CancellationToken token)
    {
        Guid userId = User.GetUserId();

        var data = await userService.GetGameFavoritesAsync(userId, token);

        return Ok(data);
    }

    [HttpPost("{userId}/gameban")]
    public async Task<IActionResult> BanUploadGameAsync([FromRoute] Guid userId, CancellationToken token)
    {
        var role = User.GetRole();

        var usernameBaned = await userService.BanUploadGame(userId, role, token);

        return Ok(new { message = $"Đã ban người chơi {usernameBaned} upload game"});
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

        var url = await userService.UpdateAvatarAsync(userId, file, token);

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