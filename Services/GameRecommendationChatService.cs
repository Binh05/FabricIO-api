using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FabricIO_api.DTOs;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class GameRecommendationChatService(
    HttpClient httpClient,
    IUnitOfWork unitOfWork,
    IConfiguration configuration,
    ILogger<GameRecommendationChatService> logger) : IGameRecommendationChatService
{
    private const int MaxCatalogSize = 50;
    private const int MaxConversationMessages = 10;
    private const int FallbackRecommendationSize = 6;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public async Task<GameRecommendationChatResponse> ChatAsync(GameRecommendationChatRequest request, CancellationToken token)
    {
        var catalog = (await GetCatalogAsync(token)).ToList();
        if (catalog.Count == 0)
        {
            return new GameRecommendationChatResponse
            {
                Reply = "Hiện tại FabricIO chưa có game nào để mình đề xuất. Bạn quay lại sau khi có thêm game nhé.",
                RecommendedGames = []
            };
        }

        var apiKey = configuration["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return CreateFallbackResponse(
                "Chức năng AI chưa được cấu hình Gemini API key. Tạm thời mình gợi ý một vài game hiện có trên FabricIO.",
                catalog);
        }

        try
        {
            var geminiResult = await AskGeminiAsync(request, catalog, apiKey, token);
            var recommendedGames = MapRecommendedGames(geminiResult.RecommendedGameIds, catalog).ToList();

            return new GameRecommendationChatResponse
            {
                Reply = string.IsNullOrWhiteSpace(geminiResult.Reply)
                    ? "Mình đã chọn một vài game phù hợp nhất từ danh sách hiện có."
                    : geminiResult.Reply.Trim(),
                RecommendedGames = recommendedGames.Count > 0
                    ? recommendedGames
                    : catalog.Take(FallbackRecommendationSize)
            };
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Gemini game recommendation failed");
            return CreateFallbackResponse(
                "Mình chưa gọi được trợ lý AI lúc này. Dưới đây là một vài game hiện có bạn có thể thử trước.",
                catalog);
        }
    }

    private async Task<IEnumerable<GameResponseDto>> GetCatalogAsync(CancellationToken token)
    {
        var result = await unitOfWork.Games.GetPaginationGameAsync(null, new GetPaginationGameDto
        {
            Page = 1,
            PageSize = MaxCatalogSize
        }, token);

        return result.Items;
    }

    private async Task<GeminiGameRecommendationResult> AskGeminiAsync(
        GameRecommendationChatRequest request,
        IEnumerable<GameResponseDto> catalog,
        string apiKey,
        CancellationToken token)
    {
        var model = configuration["Gemini:Model"];
        if (string.IsNullOrWhiteSpace(model))
        {
            model = "gemini-2.5-flash";
        }

        var prompt = BuildPrompt(request, catalog);
        var geminiRequest = new GeminiGenerateContentRequest
        {
            Contents =
            [
                new GeminiContent
                {
                    Role = "user",
                    Parts = [new GeminiPart { Text = prompt }]
                }
            ],
            GenerationConfig = new GeminiGenerationConfig
            {
                Temperature = 0.4,
                ResponseMimeType = "application/json"
            }
        };

        var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(model)}:generateContent?key={Uri.EscapeDataString(apiKey)}";
        using var response = await httpClient.PostAsJsonAsync(endpoint, geminiRequest, JsonOptions, token);

        response.EnsureSuccessStatusCode();

        var geminiResponse = await response.Content.ReadFromJsonAsync<GeminiGenerateContentResponse>(JsonOptions, token);
        var text = geminiResponse?.Candidates?
            .FirstOrDefault()?
            .Content?
            .Parts?
            .FirstOrDefault(p => !string.IsNullOrWhiteSpace(p.Text))?
            .Text;

        if (string.IsNullOrWhiteSpace(text))
        {
            throw new InvalidOperationException("Gemini response did not contain text.");
        }

        return ParseGeminiResult(text);
    }

    private string BuildPrompt(GameRecommendationChatRequest request, IEnumerable<GameResponseDto> catalog)
    {
        var conversation = request.Conversation
            .TakeLast(MaxConversationMessages)
            .Select(m => new { m.Role, m.Content });

        var compactCatalog = catalog.Select(g => new
        {
            g.Id,
            g.Title,
            g.Description,
            GameType = g.GameType.ToString(),
            g.Price,
            Tags = g.GameTags.Select(t => t.Name),
            g.CreatedAt
        });

        var payload = new
        {
            CurrentMessage = request.Message,
            Conversation = conversation,
            Catalog = compactCatalog
        };

        return $$"""
Bạn là trợ lý đề xuất game cho nền tảng FabricIO.
Hãy trả lời bằng tiếng Việt, thân thiện, ngắn gọn và hữu ích.
Chỉ được đề xuất game có trong Catalog. Không bịa tên game hoặc id ngoài Catalog.
Nếu không có game thật sự phù hợp, hãy nói rõ và chọn những game gần đúng nhất.
Ưu tiên game đúng sở thích người chơi, loại chơi, tag, mô tả và giá.

Trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON, theo schema:
{
  "reply": "Nội dung tư vấn",
  "recommendedGameIds": ["game-id-1", "game-id-2"]
}

Dữ liệu:
{{JsonSerializer.Serialize(payload, JsonOptions)}}
""";
    }

    private GeminiGameRecommendationResult ParseGeminiResult(string text)
    {
        var cleanedText = text.Trim();
        if (cleanedText.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            cleanedText = cleanedText[7..].Trim();
        }

        if (cleanedText.StartsWith("```", StringComparison.Ordinal))
        {
            cleanedText = cleanedText[3..].Trim();
        }

        if (cleanedText.EndsWith("```", StringComparison.Ordinal))
        {
            cleanedText = cleanedText[..^3].Trim();
        }

        var result = JsonSerializer.Deserialize<GeminiGameRecommendationResult>(cleanedText, JsonOptions);
        if (result == null)
        {
            throw new InvalidOperationException("Gemini JSON result is empty.");
        }

        return result;
    }

    private IEnumerable<GameResponseDto> MapRecommendedGames(IEnumerable<Guid> recommendedGameIds, IEnumerable<GameResponseDto> catalog)
    {
        var gamesById = catalog.ToDictionary(g => g.Id);

        return recommendedGameIds
            .Where(gamesById.ContainsKey)
            .Distinct()
            .Select(id => gamesById[id]);
    }

    private GameRecommendationChatResponse CreateFallbackResponse(string reply, IEnumerable<GameResponseDto> catalog)
    {
        return new GameRecommendationChatResponse
        {
            Reply = reply,
            RecommendedGames = catalog.Take(FallbackRecommendationSize)
        };
    }

    private class GeminiGenerateContentRequest
    {
        public List<GeminiContent> Contents { get; set; } = [];
        public GeminiGenerationConfig? GenerationConfig { get; set; }
    }

    private class GeminiContent
    {
        public string? Role { get; set; }
        public List<GeminiPart> Parts { get; set; } = [];
    }

    private class GeminiPart
    {
        public string? Text { get; set; }
    }

    private class GeminiGenerationConfig
    {
        public double Temperature { get; set; }
        public string? ResponseMimeType { get; set; }
    }

    private class GeminiGenerateContentResponse
    {
        public List<GeminiCandidate>? Candidates { get; set; }
    }

    private class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
    }
}
