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
    public string ThumbnailUrl { get; set; } = null!;
    [Required]
    public GameType GameType { get; set; }
    [Required]
    public string? GameUrl { get; set; } = null!;
    public decimal Price { get; set; } = 0;
    public IEnumerable<Guid> TagIds { get; set; } = [];
}

public class GetGameDto
{
    public string Search { get; set; } = string.Empty;
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}

public class GameResponseDto
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string ThumbnailUrl { get; set; } = null!;
    public GameType GameType { get; set; }
    public required string GameUrl { get; set; }
    public decimal Price { get; set; } = 0;
    public IEnumerable<GameTagResponse> GameTags { get; set; } = [];
}