namespace FabricIO_api.Entities;

public class Game
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public GameType GameType { get; set; }
    public string? GameUrl { get; set; }
    public decimal Price { get; set; } = 0;
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    //
    public User Owner { get; set; } = null!;
    public ICollection<GameTagMap> GameTagMaps { get; set; } = new List<GameTagMap>(); 
    public ICollection<GamePurchase> GamePurchases { get; set; } = new List<GamePurchase>();
    public ICollection<GameComment> GameComments { get; set; } = new List<GameComment>();
    public ICollection<GameFavorite> GameFavorites { get; set; } = new List<GameFavorite>();
    public ICollection<GameRating> GameRatings { get; set; } = new List<GameRating>();
    public ICollection<GamePlay> GamePlays { get; set; } = new List<GamePlay>();
}

public enum GameType
{
    Browser,
    Download
}