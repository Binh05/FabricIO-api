using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IGamePurchaseService
{
    Task<GamePurchaseResponse> PaidGameAsync(Guid gameId, Guid userId, PaidGameReq req, CancellationToken token);
}
