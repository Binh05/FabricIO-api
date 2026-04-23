using FabricIO_api.DTOs;
using FabricIO_api.Services;
using FabricIO_api.UnitOfWork;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/users")]
public class GameFavoritesController(IGameFavoriteService gameFavoriteService) : ControllerBase
{

    [HttpPost("{id}/favrotite")]
    public async Task<ActionResult>  MarkAsFavorAsync([FromRoute] Guid id, CancellationToken token)
    {
        var userId = User.GetUserId();

        await gameFavoriteService.MarkAsFavoriteAsync(userId, id, token);

        return Created();
    }

    [HttpDelete("{gameId}/favorite")]
    public async Task<IActionResult> UnFavorAsync([FromRoute] Guid gameId, CancellationToken token)
    {
        var userId = User.GetUserId();

        await gameFavoriteService.UnFavoriteAsync(userId, gameId, token);

        return Ok(new { message = "Xoá Game khỏi danh sách yêu thích thành công" });
    }
}