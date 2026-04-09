using AutoMapper;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpPost]
    public async Task<User> InsertUserAsync([FromBody] UserDto user, CancellationToken token)
    {
        var entity = await userService.InsertAsync(user, token);

        return entity;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersAsync(CancellationToken token)
    {
        var entities = await userService.GetAsync(token);

        return Ok(entities);
    }
}