using AutoMapper;
using AutoMapper.QueryableExtensions;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.UnitOfWork
{
    public class GameRepository(IMapper mapper, AppDbContext dbContext) : Repository<Game>(mapper, dbContext), IGameRepository
    {
        public async Task<IEnumerable<FeaturedGameRatingResponse>> GetTopGameRatingsAsync(int top, CancellationToken token)
        {
            var result = await dbContext.Games
                .OrderByDescending(g => g.GameRatings.Any()
                ? g.GameRatings.Average(r => (double)r.Stars) : 0)
                .Take(top)
                .ProjectTo<FeaturedGameRatingResponse>(mapper.ConfigurationProvider)
                .ToListAsync(token);

            return result;
        }
    }
}
