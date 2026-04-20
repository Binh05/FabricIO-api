using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameFavoriteService(IUnitOfWork unitOfWork) : IGameFavoriteService
{
    public async Task MarkAsFavoriteAsync(Guid userId, Guid gameId, CancellationToken token)
    {
        var userExisting = await unitOfWork.Users.GetEntityAsync(u => u.Id ==userId, token);

        if (userExisting == null)
        {
            throw new NotFoundException("User không tôn tại");
        }

        var gameExisting = await unitOfWork.Games.GetEntityAsync(g => g.Id == gameId, token);

        if (gameExisting == null)
        {
            throw new NotFoundException("Game không tồn tại");
        }

        var gameFavor = new GameFavorite
        {
            UserId = userId,
            GameId = gameId
        };

        unitOfWork.GameFavorites.Insert(gameFavor);
        await unitOfWork.SaveAsync(token);
    }
}