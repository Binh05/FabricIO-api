namespace FabricIO_api.Entities;

public class GameRating
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid UserId { get; set; }
    public int Stars { get; set; } // 1 - 5 nha ae
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //
    public User User { get; set; } = null!;
    public Game Game { get; set; } = null!;
}

public class GameFavorite
{
    public Guid GameId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //
    public User User { get; set; } = null!;
    public Game Game { get; set; } = null!;
}

public class GameComment
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid UserId { get; set; }
    public required string Content { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //
    public Game Game { get; set; } = null!;
    public User User { get; set; } = null!;
}

public class GamePurchase
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid BuyerId { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    //
    public Game Game { get; set; } = null!;
    public User Buyer { get; set; } = null!;
}