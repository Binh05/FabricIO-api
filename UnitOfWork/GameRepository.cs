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
        public async Task<GamePaginationResult> GetPaginationGameAsync(Guid? userId, GetPaginationGameDto req, CancellationToken token)
        {
            var query = dbContext.Games.AsQueryable();

            if (!string.IsNullOrWhiteSpace(req.Search))
            {
                query = query.Where(g =>
                    g.Title.Contains(req.Search) ||
                    (g.Description != null &&
                     g.Description.Contains(req.Search)));
            }

            var total = await query.CountAsync(token);

            var result = query
                .Skip((req.Page - 1) * req.PageSize)
                .Take(req.PageSize)
                .Select(g => new GameResponseDto {
                    Id = g.Id,
                    OwnerId = g.OwnerId,
                    Title = g.Title,
                    Description = g.Description,
                    ThumbnailUrl = g.ThumbnailUrl,
                    GameType = g.GameType,
                    Price = g.Price,
                    IsFavorite = userId == null ? false : g.GameFavorites.Where(gf => gf.UserId == userId && gf.GameId == g.Id).Any(),
                    GameTags = g.GameTagMaps.Select(m => new GameTagResponse
                    {
                        Id = m.Tag.Id,
                        Name = m.Tag.Name
                    }),
                    CreatedAt = g.CreatedAt
                });

            return new GamePaginationResult { 
                Total = total,
                Page = req.Page,
                PageSize = req.PageSize,
                Items = result
            };
        }

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
