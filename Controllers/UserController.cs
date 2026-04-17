using FabricIO_api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FabricIO_api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController(IStorageServices storageServices) : ControllerBase
{
    [HttpPost("avatar")]
    public async Task<ActionResult<string>> UploadAvatar(IFormFile file, CancellationToken token)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Ảnh không hợp lệ");
        }
        
        var url = await storageServices.UploadAsync(file, token);

        return Ok(new { avatarUrl = url });
    }
}