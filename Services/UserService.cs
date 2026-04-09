using AutoMapper;
using AutoMapper.QueryableExtensions;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.Services;

public class UserService(IUnitOfWork uof, IMapper mapper) : IUserService
{
    public async Task<IEnumerable<UserDto>> GetAsync(CancellationToken token)
    {
        return await uof.Users.GetAllAsync<UserDto>(token);
    }

    public async Task<User> InsertAsync(UserDto user, CancellationToken token)
    {
        var entity = mapper.Map<User>(user);
        uof.Users.Insert(entity);
        await uof.SaveAsync(token);

        return entity;
    }
}