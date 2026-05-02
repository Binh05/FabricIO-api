using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AdminController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAllAsync(CancellationToken token)
    {
        var role = User.GetRole();

        var data = await userService.GetAllAsync(role, token);

        return Ok(data);
    }

    [HttpPatch("{userId}/gameban")]
    public async Task<IActionResult> UpdateGameBannedAsync([FromRoute] Guid userId, [FromBody] UpdateGameBanDto request, CancellationToken token)
    {
        var role = User.GetRole();

        var username = await userService.UpdateGameBannedAsync(userId, request.IsGameBanned, role, token);

        return Ok(new { message = $"Đã cập nhật trạng thái cấm upload game của người chơi {username}" });
    }

    [HttpPatch("{userId}/ban")]
    public async Task<IActionResult> UpdateBannedAsync([FromRoute] Guid userId, [FromBody] UpdateAccountBanDto request, CancellationToken token)
    {
        var role = User.GetRole();
        var username = await userService.UpdateBannedAsync(userId, request.IsBanned, request.BanExpiresAt, role, token);
        return Ok(new { message = $"Đã cập nhật trạng thái ban của người chơi {username}" });
    }

    [HttpPatch("{userId}/postban")]
    public async Task<IActionResult> UpdatePostBannedAsync([FromRoute] Guid userId, [FromBody] UpdatePostBanDto request, CancellationToken token)
    {
        var role = User.GetRole();
        var username = await userService.UpdatePostBannedAsync(userId, request.IsPostBanned, role, token);
        return Ok(new { message = $"Đã cập nhật trạng thái cấm đăng bài của người chơi {username}" });
    }
}
