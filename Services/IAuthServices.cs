using FabricIO_api.Entities;
using Microsoft.Extensions.Options;

namespace FabricIO_api.Services;

public interface IAuthServices
{
    string GenerateJwtToken(Guid userId);
}