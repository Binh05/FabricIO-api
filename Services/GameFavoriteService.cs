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

    public async Task UnFavoriteAsync(Guid userId, Guid gameId, CancellationToken token)
    {

        var entity = await unitOfWork.GameFavorites.GetEntityAsync(gf => gf.UserId == userId && gf.GameId == gameId, token);
        if (entity == null)
        {
            throw new NotFoundException("Bạn không có game này trong danh sách yêu thích");
        }

        unitOfWork.GameFavorites.Delete(entity);

        await unitOfWork.SaveAsync(token);
    }
}