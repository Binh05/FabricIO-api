namespace FabricIO_api.Entities;

public class User
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string HashedPassword { get; set; }
    public required string DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsBanned { get; set; } = false;
    public DateTime? BanExpiresAt { get; set; }
    public bool IsPostBanned { get; set; } = false;
    public bool IsGameBanned { get; set; } = false;
    public decimal Balance { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    //
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
    public ICollection<Game> Games { get; set; } = new List<Game>();
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<GamePurchase> GamePurchases { get; set; } = new List<GamePurchase>();
    public ICollection<GameComment> GameComments { get; set; } = new List<GameComment>();
    public ICollection<GameFavorite> GameFavorites { get; set; } = new List<GameFavorite>();
    public ICollection<GameRating> GameRatings { get; set; } = new List<GameRating>();
    public ICollection<PostReaction> PostReactions { get; set; } = new List<PostReaction>();
    public ICollection<PostComment> PostComments { get; set; } = new List<PostComment>();
    public ICollection<Follow> Followers { get; set; } = new List<Follow>();
    public ICollection<Follow> Followings { get; set; } = new List<Follow>();
    public ICollection<Block> Blockers { get; set; } = new List<Block>();
    public ICollection<Block> Blockeds { get; set; } = new List<Block>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<GamePlay> GamePlays { get; set; } = new List<GamePlay>(); 
}

public enum UserRole
{
    User,
    Admin
}