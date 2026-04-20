using FabricIO_api.DTOs;
using FabricIO_api.Services;
using FabricIO_api.UnitOfWork;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/Games")]
public class GameInteractionsController(IGameFavoriteService gameFavoriteService, IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpPost("{id}/favrotite")]
    public async Task<ActionResult>  MarkAsFavorAsync([FromRoute] Guid id, CancellationToken token)
    {
        var userId = User.GetUserId();

        await gameFavoriteService.MarkAsFavoriteAsync(userId, id, token);

        return Created();
    }
    [HttpGet("favorite")]
    public async Task<IEnumerable<GameFavoriteResponse>> Get(CancellationToken token)
    {
        return await unitOfWork.GameFavorites.GetAllAsync<GameFavoriteResponse>(token);
    }
}