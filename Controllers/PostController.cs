using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PostController(IPostService postService) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<PostResponseDto>> GetByIdAsync([FromRoute] Guid id, CancellationToken token)
    {
        var currentUserId = User.TryGetUserId();
        var response = await postService.GetPostByIdAsync(id, currentUserId, token);
        return Ok(response);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PostPaginationResult>> GetPostsAsync([FromQuery] PaginationDto pagination, CancellationToken token)
    {
        var currentUserId = User.TryGetUserId();
        var entities = await postService.GetPostsAsync(pagination, currentUserId, token);
        return Ok(entities);
    }

    [AllowAnonymous]
    [HttpGet("trending")]
    public async Task<ActionResult<PostPaginationResult>> GetTrendingPostsAsync([FromQuery] PaginationDto pagination, CancellationToken token)
    {
        var currentUserId = User.TryGetUserId();
        var entities = await postService.GetTrendingPostsAsync(pagination, currentUserId, token);
        return Ok(entities);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PostPaginationResult>> GetPostsByUserIdAsync([FromRoute] Guid userId, [FromQuery] PaginationDto pagination, CancellationToken token)
    {
        var currentUserId = User.TryGetUserId();
        var entities = await postService.GetPostsByUserIdAsync(userId, pagination, currentUserId, token);
        return Ok(entities);
    }

    [HttpGet("user/me")]
    [Authorize]
    public async Task<ActionResult<PostPaginationResult>> GetMyPostsAsync([FromQuery] PaginationDto pagination, CancellationToken token)
    {
        Guid userId = User.GetUserId();
        var entities = await postService.GetPostsByUserIdAsync(userId, pagination, userId, token);
        return Ok(entities);
    }

    [HttpPost]
    public async Task<ActionResult<PostResponseDto>> PostAsync([FromForm] PostRequestDto postReq, CancellationToken token)
    {
        Guid userId = User.GetUserId();
        var response = await postService.CreatePostAsync(userId, postReq, token);
        return Ok(response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PostResponseDto>> PutAsync([FromRoute] Guid id, [FromForm] UpdatePostRequestDto postReq, CancellationToken token)
    {
        Guid userId = User.GetUserId();
        var response = await postService.UpdatePostAsync(userId, id, postReq, token);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAsync([FromRoute] Guid id, CancellationToken token)
    {
        Guid userId = User.GetUserId();
        await postService.DeletePostAsync(userId, id, token);
        return NoContent();
    }
}
