using FabricIO_api.Entities;

namespace FabricIO_api.DTOs;

public class GameFavoriteResponse
{
    public Guid GameId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public GameType GameType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}