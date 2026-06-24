using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.DTOs;

public class GameRecommendationChatRequest
{
    [Required]
    [StringLength(1000, MinimumLength = 1, ErrorMessage = "Tin nhắn phải từ 1 đến 1000 ký tự")]
    public string Message { get; set; } = null!;

    public List<GameRecommendationChatMessage> Conversation { get; set; } = [];
}

public class GameRecommendationChatMessage
{
    [Required]
    [RegularExpression("^(user|assistant)$", ErrorMessage = "Role chỉ nhận giá trị user hoặc assistant")]
    public string Role { get; set; } = null!;

    [Required]
    [StringLength(1000, MinimumLength = 1, ErrorMessage = "Nội dung hội thoại phải từ 1 đến 1000 ký tự")]
    public string Content { get; set; } = null!;
}

public class GameRecommendationChatResponse
{
    public string Reply { get; set; } = null!;
    public IEnumerable<GameResponseDto> RecommendedGames { get; set; } = [];
}

public class GeminiGameRecommendationResult
{
    public string Reply { get; set; } = null!;
    public IEnumerable<Guid> RecommendedGameIds { get; set; } = [];
}
