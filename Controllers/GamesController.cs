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
    public async Task<ActionResult<IEnumerable<GameResponseDto>>> GetGamesAsync([FromQuery] GetGameDto param, CancellationToken token)
    {
        var entities = await gameServices.GetAsync(param, token);

        return Ok(new { GameTotal = entities.Count(), games = entities});
    }
    
    [HttpPost]
    public async Task<ActionResult<GameResponseDto>> PostGameAsync([FromBody] GameRequestDto gameReq, CancellationToken token)
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
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGameAsync([FromRoute] Guid id, CancellationToken token)
    {
        var userId = User.GetUserId();
        await gameServices.DeleteAsync(userId, id, token);

        return NoContent();
    }
}