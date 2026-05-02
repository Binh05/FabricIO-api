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
        var result = await dbContext.Set<GameRating>()
        .Where(r => r.GameId == gameId)
        .GroupBy(r => 1)
        .Select(g => new GameRatingResponse
        {
            Total = g.Count(),
            Average = g.Average(x => (double)x.Stars)
        })
        .FirstOrDefaultAsync(token);

        return result ?? new GameRatingResponse
        {
            Total = 0,
            Average = 0
        };
    }

}
