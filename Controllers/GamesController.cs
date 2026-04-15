using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Services;
using FabricIO_api.UnitOfWork;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController(IGameServices gameServices) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetGamesAsync([FromQuery] GetGameDto param, CancellationToken token)
    {
        var entities = await gameServices.GetAsync(param, token);

        return Ok(new { GameTotal = entities.Count(), entities});
    }
    
    [HttpPost]
    public async Task<Game> PostGameAsync([FromBody] GameDto game, CancellationToken token)
    {
        var entity = await gameServices.InsertAsync(game, token);

        return entity;
    }

    [HttpPost("list")]
    public async Task<IEnumerable<Game>> InsertRangeAsync([FromBody] IEnumerable<GameDto> games, CancellationToken token)
    {
        var entities = await gameServices.InsertRangeAsync(games, token);

        return entities;
    }
}