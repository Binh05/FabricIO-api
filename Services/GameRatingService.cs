using FabricIO_api.DTOs;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services
{
    public class GameRatingService(IUnitOfWork unitOfWork) : IGameRatingService
    {
        public async Task<GameRatingResponse> GetRatingsAsync(Guid gameId, CancellationToken token)
        {
            var data = await unitOfWork.GameRatings.GetRatingAsync(gameId, token);

            return data;
        }

        public async Task<int> RatingAsync(Guid userId, Guid gameId, RatingRequest req, CancellationToken token)
        {
            var rating = await unitOfWork.GameRatings.GetEntityAsync(r => r.UserId == userId && r.GameId == gameId, token);

            if (rating == null)
            {
                rating = new Entities.GameRating
                {
                    UserId = userId,
                    GameId = gameId,
                    Stars = req.Stars
                };

                unitOfWork.GameRatings.Insert(rating);
            }
            else
            {
                rating.Stars = req.Stars;
            }

            await unitOfWork.SaveAsync(token);

            return rating.Stars;
        }
    }
}
