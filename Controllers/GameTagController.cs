using FabricIO_api.DTOs;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameTagController(IGameTagService gameTagService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameTagResponse>>> GetGameTagListAsync(CancellationToken token)
    {
        var entities = await gameTagService.GetAllAsync(token);

        return Ok(entities);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameTagResponse>> GetByIdAsync(Guid id, CancellationToken token)
    {
        var tag = await gameTagService.GetByIdAsync(id, token);
        return Ok(tag);
    }

    [HttpPost]
    public async Task<ActionResult<GameTagResponse>> PostGameTagAsync([FromBody] GameTagRequest gameTag, CancellationToken token)
    {
        var entity = await gameTagService.InsertTagAsync(gameTag, token);

        return CreatedAtAction("GetById", new { id = entity.Id }, entity);
    }
}