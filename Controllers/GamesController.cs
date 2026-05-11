using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Services;
using FabricIO_api.UnitOfWork;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GamesController(IGameServices gameServices) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<GameResponseDto>> GetByIdAsync([FromRoute] string id, CancellationToken token)
    {
        if (!Guid.TryParse(id, out Guid gameId))
        {
            return BadRequest();
        }
        var response = await gameServices.GetByIdAsync(gameId, token);

        if (response == null)
            return NotFound();

        return Ok(new { game = response});
    }
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<GamePaginationResult>> GetGamesAsync([FromQuery] GetPaginationGameDto param, CancellationToken token)
    {
        var userId = User.TryGetUserId();
        var entities = await gameServices.GetAllAsync(userId, param, token);

        return Ok(entities);
    }

    [AllowAnonymous]
    [HttpGet("featuredGame")]
    public async Task<ActionResult<FeaturedGameResponse>> GetGamePlayHighestAsync(CancellationToken token)
    {
        var entity = await gameServices.GetGamePlayHighestAsync(token);

        if (entity == null)
        {
            return NotFound(new { message = "Chưa có game nào được chơi" });
        }

        return Ok(entity);
    }

    [AllowAnonymous]
    [HttpGet("topRatingGames")]
    public async Task<ActionResult<IEnumerable<FeaturedGameRatingResponse>>> GetTopRatingGamesAsync([FromQuery] FeaturedGameRatingRequest req, CancellationToken token)
    {
        var result = await gameServices.GetTopRatingGamesAsync(req.Top, token);

        return Ok(result);
    }

    [HttpGet("{gameId}/play")]
    public async Task<ActionResult<GamePlayResponseDto>> GetGameUrlAsync([FromRoute] Guid gameId, CancellationToken token)
    {
        var userId = User.GetUserId();

        var url = await gameServices.GetPlayUrlAsync(userId, gameId, token);

        return Ok(new { GameUrl = url });
    }

    [HttpGet("{gameId}/download")]
    public async Task<ActionResult<GameDownloadDto>> DownloadGameAsync([FromRoute] Guid gameId, CancellationToken token)
    {
        var data = await gameServices.DownloadGameAsync(gameId, token);

        return Ok(data);
    }
    
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(524288000)]
    public async Task<ActionResult<GameResponseDto>> CreateGameAsync([FromForm] GameRequestDto gameReq, CancellationToken token)
    {
        Guid userId = User.GetUserId();

        var response = await gameServices.CreateGameAsync(userId, gameReq, token);

        return Ok(response);
    }

    [HttpPost("list")]
    public async Task<IEnumerable<Game>> InsertRangeAsync([FromBody] IEnumerable<GameRequestDto> games, CancellationToken token)
    {
        var entities = await gameServices.InsertRangeAsync(games, token);

        return entities;
    }

    [HttpPatch("{gameId}")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(524288000)]
    public async Task<GameResponseDto> UpdateGameAsync(
        [FromRoute] Guid gameId,
        [FromForm] UpdateGameRequest req,
        CancellationToken token)
    {
        var userId = User.GetUserId();
        return await gameServices.UpdateGameAsync(userId, gameId, req, token);
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGameAsync([FromRoute] Guid id, CancellationToken token)
    {
        var userId = User.GetUserId();
        var role = User.GetRole();
        await gameServices.DeleteAsync(userId, role, id, token);

        return NoContent();
    }
}