using AutoMapper;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.UnitOfWork;

public class GameRatingRepository(IMapper mapper, AppDbContext dbContext) : Repository<GameRating>(mapper, dbContext), IGameRatingRepository
{
    public async Task<GameRatingResponse> GetRatingAsync(Guid gameId, CancellationToken token)
    {
        var ratings = dbContext.Set<GameRating>().Where(r => r.GameId == gameId);

        var total = await ratings.CountAsync(token);
        var avg = total == 0 ? 0 : await ratings.AverageAsync(r => (double)r.Stars ,token);

        return new GameRatingResponse
        {
            Total = total,
            Average = avg
        };
    }
}
