using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Authorize]
[ApiController]
[Route("api/post/reaction")]
public class PostReactionsController(IPostReactionService postReactionService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult> CreateAsync([FromBody] PostReactRequestDto request, CancellationToken token)
    {
        var userId = User.GetUserId();

        await postReactionService.CreateAsync(userId, request, token);

        return Ok();
    }

    [HttpDelete("{postId}")]
    public async Task<ActionResult> DeleteAsync([FromRoute] Guid postId, CancellationToken token)
    {
        var userId = User.GetUserId();

        await postReactionService.DeleteAsync(userId, postId, token);

        return Ok();
    }
}
