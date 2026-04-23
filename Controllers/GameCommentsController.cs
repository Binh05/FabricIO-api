using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/games")]
public class GameCommentsController(IGameCommentService gameCommentService) : ControllerBase
{
    [HttpGet("{gameId}/comment")]
    public async Task<ActionResult<IEnumerable<GameCommentResponse>>> GetByIdAsync(
        [FromRoute] Guid gameId,
        [FromQuery] PaginationDto param, 
        CancellationToken token)
    {
        var res = await gameCommentService.GetCommentsAsync(gameId, param, token);
        return Ok(res);
    }

    [Authorize]
    [HttpPost("{gameId}/comment")]
    public async Task<ActionResult<GameCommentResponse>> PostCommentAsync(
        [FromRoute] Guid gameId,
        [FromBody] GameCommentDto req,
        CancellationToken token)
    {
        var userId = User.GetUserId();

        var res = await gameCommentService.InsertCommentAsync(userId, gameId, req, token);

        return Ok(res);
    }

    [Authorize]
    [HttpPatch("{commentId}/comment")]
    public async Task<ActionResult<GameCommentResponse>> PatchCommentAsync(
        [FromRoute] Guid commentId,
        [FromBody] GameCommentDto req,
        CancellationToken token)
    {
        var userId = User.GetUserId();

        var res = await gameCommentService.ChangeCommentAsync(userId, commentId, req, token);

        return Ok(new { message = "Chinh sua comment thanh cong", data = res });
    }

    [HttpDelete("{commentId}/comment")]
    public async Task<IActionResult> DeleteCommentAsync([FromRoute] Guid commentId, CancellationToken token)
    {
        var userId = User.GetUserId();
        var role = User.GetRole();

        await gameCommentService.DeleteCommentAsync(userId, role, commentId, token);

        return Ok(new { message = "Xóa comment thành công" });
    }
}
