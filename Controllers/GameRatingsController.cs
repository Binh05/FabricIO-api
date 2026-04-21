using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Route("api/games")]
[ApiController]
public class GameRatingsController(IGameRatingService gameRatingService) : ControllerBase
{
    [HttpGet("{gameId}/ratings")]
    public async Task<ActionResult<GameRatingResponse>> GetRatingsGameAsync([FromRoute] Guid gameId, CancellationToken token) 
    {
        var data = await gameRatingService.GetRatingsAsync(gameId, token);

        return Ok(data);
    }

    [HttpPut("{gameId}/ratings")]
    public async Task<ActionResult> RatingAsync(
        [FromRoute] Guid gameId,
        [FromBody] RatingRequest req,
        CancellationToken token)
    {
        var userId = User.GetUserId();

        var stars = await gameRatingService.RatingAsync(userId, gameId, req, token);

        return Ok(new { message = $"Đã rating {stars} sao" });
    }

    [HttpDelete("{ratingId}/rating")]
    public async Task<IActionResult> DeleteRatingAsync([FromRoute] Guid ratingId, CancellationToken token)
    {
        await gameRatingService.DeleteAsync(ratingId, token);

        return Ok(new { message = "Xoa thanh cong" });
    }
}
