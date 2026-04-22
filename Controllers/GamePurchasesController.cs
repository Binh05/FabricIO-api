using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/games")]
public class GamePurchasesController(IGamePurchaseService gamePurchaseService) : ControllerBase
{
    [HttpPost("{gameId}/purchase")]
    public async Task<ActionResult<GamePurchaseResponse>> PaidGameAsync([FromRoute] Guid gameId, PaidGameReq req, CancellationToken token)
    {
        var userId = User.GetUserId();

        var res = await gamePurchaseService.PaidGameAsync(gameId, userId, req, token);

        return Ok(res);
    }
}
