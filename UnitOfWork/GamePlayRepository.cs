using AutoMapper;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.UnitOfWork
{
    public class GamePlayRepository(IMapper mapper, AppDbContext dbContext) : Repository<GamePlay>(mapper, dbContext), IGamePlayRepository
    {
        public async Task<FeaturedGameResponse?> GetFeaturedGameAsync(CancellationToken token)
        {
            var topGamePlay = await dbContext.GamePlays
                .GroupBy(x => x.GameId)
                .Select(gp => new
                {
                    GameId = gp.Key,
                    TotalPlay = gp.Count()
                })
                .OrderByDescending(x => x.TotalPlay)
                .Join(
                    dbContext.Games,
                    gp => gp.GameId,
                    g => g.Id,
                    (gp, game) => new
                    {
                        Game = game,
                        TotalPlay = gp.TotalPlay
                    }
                )
                .FirstOrDefaultAsync(token);

            if (topGamePlay == null) return null;

            return new FeaturedGameResponse
            {
                TotalPlay = topGamePlay.TotalPlay,
                Game = mapper.Map<GameResponseDto>(topGamePlay.Game)
            };
        }
    }
}
