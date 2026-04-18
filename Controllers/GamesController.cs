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
public class GamesController(IGameServices gameServices, IGameTagService gameTagService, IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameResponseDto>>> GetGamesAsync([FromQuery] GetGameDto param, CancellationToken token)
    {
        var entities = await gameServices.GetAsync(param, token);

        return Ok(new { GameTotal = entities.Count(), games = entities});
    }
    
    [HttpPost]
    public async Task<ActionResult<GameResponseDto>> PostGameAsync([FromBody] GameRequestDto gameReq, CancellationToken token)
    {
        var userId = User.GetUserId();

        var entity = mapper.Map<Game>(gameReq);

        if (gameReq.TagIds != null && gameReq.TagIds.Any())
        {
            var validGameTags = await gameTagService.ValidTagsAsync(gameReq.TagIds, token);
            gameServices.AddGameTag(entity, validGameTags);
        }

        await gameServices.InsertAsync(userId, entity, token);

        var response = mapper.Map<GameResponseDto>(entity);
        response.GameTags = await gameTagService.GetTagByGameIdAsync(entity.Id, token);
        return Ok(response);
    }

    [HttpPost("list")]
    public async Task<IEnumerable<Game>> InsertRangeAsync([FromBody] IEnumerable<GameRequestDto> games, CancellationToken token)
    {
        var entities = await gameServices.InsertRangeAsync(games, token);

        return entities;
    }
}