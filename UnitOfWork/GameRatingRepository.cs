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

    public async Task<IEnumerable<FeaturedGameRatingResponse>> GetTopRatingGamesAsync(int top, CancellationToken token)
    {
        var result = await dbContext.GameRatings
        .GroupBy(r => r.GameId)
        .Select(g => new FeaturedGameRatingResponse
        {
            AverageRating = g.Average(x => (double)x.Stars),
            TotalRating = g.Count(),
            Game = mapper.Map<GameResponseDto>(g.Key)
        })
        .OrderByDescending(g => g.AverageRating)
        .Take(top)
        .ToListAsync(token);

        return result;
    }
}
