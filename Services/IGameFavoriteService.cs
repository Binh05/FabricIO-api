namespace FabricIO_api.Services;

public interface IGameFavoriteService
{
    Task MarkAsFavoriteAsync(Guid userId, Guid gameId, CancellationToken token);
}