using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/post")]
public class PostCommentsController(IPostCommentService postCommentService) : ControllerBase
{
    [HttpGet("{postId}/comment")]
    public async Task<ActionResult<PostCommentPaginationResult>> GetCommentsAsync(
        [FromRoute] Guid postId,
        [FromQuery] PaginationDto pagination,
        CancellationToken token)
    {
        var response = await postCommentService.GetCommentsAsync(postId, pagination, token);
        return Ok(response);
    }

    [Authorize]
    [HttpPost("{postId}/comment")]
    public async Task<ActionResult<PostCommentResponse>> CreateCommentAsync(
        [FromRoute] Guid postId,
        [FromBody] PostCommentDto request,
        CancellationToken token)
    {
        var userId = User.GetUserId();
        var response = await postCommentService.InsertCommentAsync(userId, postId, request, token);
        return Ok(response);
    }

    [Authorize]
    [HttpPatch("comment/{commentId}")]
    public async Task<ActionResult<PostCommentResponse>> UpdateCommentAsync(
        [FromRoute] Guid commentId,
        [FromBody] PostCommentDto request,
        CancellationToken token)
    {
        var userId = User.GetUserId();
        var response = await postCommentService.UpdateCommentAsync(userId, commentId, request, token);
        return Ok(response);
    }

    [Authorize]
    [HttpDelete("comment/{commentId}")]
    public async Task<ActionResult> DeleteCommentAsync([FromRoute] Guid commentId, CancellationToken token)
    {
        var userId = User.GetUserId();
        var role = User.GetRole();

        await postCommentService.DeleteCommentAsync(userId, role, commentId, token);
        return Ok(new { message = "Xóa comment thành công" });
    }
}
