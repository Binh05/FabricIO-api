using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/games")]
public class GameCommentsController(IGameCommentService gameCommentService) : ControllerBase
{
    [HttpGet("{GameId}/comment")]
    public async Task<ActionResult<IEnumerable<GameCommentResponse>>> GetByIdAsync([FromRoute] GameCommentPagination param, CancellationToken token)
    {
        var res = await gameCommentService.GetCommentsAsync(param, token);
        return Ok(res);
    }

    [Authorize]
    [HttpPost("{gameId}/comment")]
    public async Task<ActionResult<GameCommentResponse>> PostCommentAsync(
        [FromRoute] Guid gameId,
        [FromBody] string content,
        CancellationToken token)
    {
        var userId = User.GetUserId();

        var res = await gameCommentService.InsertCommentAsync(userId, gameId, content, token);

        return Ok(res);
    }
}
