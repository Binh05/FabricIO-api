using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/game-recommendation-chat")]
public class GameRecommendationChatController(IGameRecommendationChatService chatService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<GameRecommendationChatResponse>> ChatAsync(
        [FromBody] GameRecommendationChatRequest request,
        CancellationToken token)
    {
        var response = await chatService.ChatAsync(request, token);

        return Ok(response);
    }
}
