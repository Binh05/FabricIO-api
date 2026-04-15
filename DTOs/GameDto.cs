using FabricIO_api.Entities;

namespace FabricIO_api.DTOs;

public class GameDto
{
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public GameType GameType { get; set; }
    public string? GameUrl { get; set; }     
    public string? GameKey { get; set; }   // for downloadable games
    public decimal Price { get; set; } = 0;
}

public class GetGameDto
{
    public string Search { get; set; } = string.Empty;
    public int? Page { get; set; }
    public int? PageSize { get; set; }
}