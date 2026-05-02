using System.ComponentModel.DataAnnotations;
using FabricIO_api.Entities;

namespace FabricIO_api.DTOs;

public class GameRequestDto
{
    [Required]
    public string Title { get; set; } = null!;
    [MaxLength(500, ErrorMessage = "Mô tả chỉ tối đa 500 ký tự")]
    public string? Description { get; set; }
    [Required]
    public IFormFile Thumbnail { get; set; } = null!;
    [Required]
    public GameType GameType { get; set; }
    [Required]
    public IFormFile GameFile { get; set; } = null!;
    public decimal Price { get; set; } = 0;
    public List<Guid> TagIds { get; set; } = new();
}

public class GetGameDto
{
    public string Search { get; set; } = string.Empty;
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}

public class GameDownloadDto
{
    public required string DownloadUrl { get; set; }
}

public class GameResponseDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string ThumbnailUrl { get; set; } = null!;
    public GameType GameType { get; set; }
    public decimal Price { get; set; } = 0;
    public IEnumerable<GameTagResponse> GameTags { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}

public class GamePlayResponseDto
{
    public string GameUrl { get; set; } = null!;
}

public class FeaturedGameResponse
{
    public int TotalPlay { get; set; }
    public required GameResponseDto Game { get; set; }
}

public class FeaturedGameRatingResponse 
{
    public double AverageRating { get; set; }
    public int TotalRating { get; set; }
    public required GameResponseDto Game { get; set; }
}

public class FeaturedGameRatingRequest
{
    [Range(1, 100, ErrorMessage = "Top phải nằm trong khoảng từ 1 đến 100")]
    public int Top { get; set; } = 6;
}