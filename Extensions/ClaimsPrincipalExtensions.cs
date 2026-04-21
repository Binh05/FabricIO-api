using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using System.Security.Claims;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(id!);
    }

    public static UserRole GetRole(this ClaimsPrincipal user)
    {
        var role = user.FindFirst(ClaimTypes.Role)?.Value;
        
        if (Enum.TryParse<UserRole>(role, out var parsedRole)) {
            return parsedRole;
        }

        throw new UnauthorizedException("Role khong hop le");
    }
}