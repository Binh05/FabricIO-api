using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GamePurchaseService(IUnitOfWork unitOfWork, IMapper mapper) : IGamePurchaseService
{
    public async Task<GamePurchaseResponse> PaidGameAsync(Guid gameId, Guid userId, PaidGameReq req, CancellationToken token)
    {
        var game = await unitOfWork.Games.GetEntityAsync(g => g.Id == gameId, token);

        if (game == null)
        {
            throw new NotFoundException("Game ko ton tai");
        }

        if (game.Price != Math.Round(req.Amound, 2))
        {
            throw new BadRequestException("So tien khong hop le");
        }

        var purchase = new GamePurchase
        {
            GameId = gameId,
            BuyerId = userId!,
            AmountPaid = req.Amound
        };

        unitOfWork.GamePurchases.Insert(purchase);
        await unitOfWork.SaveAsync(token);

        return mapper.Map<GamePurchaseResponse>(purchase);
    }
}
