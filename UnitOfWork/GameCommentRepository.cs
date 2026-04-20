using AutoMapper;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.UnitOfWork;

public class GameCommentRepository(IMapper mapper, AppDbContext dbContext) : Repository<GameComment>(mapper, dbContext), IGameCommentRepository
{
    public async Task<GameCommentPaginationResult> GetPageCommentAsync(GameCommentPagination req, CancellationToken token)
    {
        var query = dbContext.GameComments.AsQueryable();

        query = query.Where(c => c.GameId == req.GameId);

        var total = await query.CountAsync(token);

        var data = await query.OrderByDescending(c => c.CreatedAt)
                    .Skip((req.Page - 1) * req.PageSize)
                    .Take(req.PageSize)
                    .ToListAsync(token);

        return new GameCommentPaginationResult
        {
            Total = total,
            Items = mapper.Map<IEnumerable<GameCommentResponse>>(data),
            Page = req.Page,
            PageSize = req.PageSize
        };
    }
}
