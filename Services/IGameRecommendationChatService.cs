using FabricIO_api.DTOs;

namespace FabricIO_api.Services;

public interface IGameRecommendationChatService
{
    Task<GameRecommendationChatResponse> ChatAsync(GameRecommendationChatRequest request, CancellationToken token);
}
