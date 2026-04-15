using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.Services;

public interface IUserService
{
    Task<User> InsertAsync(UserDto user, CancellationToken token);
    Task<IEnumerable<UserDto>> GetAsync(CancellationToken token);

    Task<IEnumerable<User>> InsertRangeAsync(IEnumerable<UserDto> users, CancellationToken token);
}