namespace FabricIO_api.Entities;

public class Post
{
    public Guid Id { get; set; }
    public Guid AuthorId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    //
    public User Author { get; set; } = null!;
    public ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
    public ICollection<PostReaction> Reactions { get; set; } = new List<PostReaction>();
    public ICollection<PostMedia> Media { get; set; } = new List<PostMedia>();
}

public class PostMedia
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public required string MediaUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Post Post { get; set; } = null!;
}

public class PostComment
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public required string Content { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //
    public User User { get; set; } = null!;
    public Post Post { get; set; } = null!;
}

public class PostReaction
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public ReactionType ReactionType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Post Post { get; set; } = null!;
}

public enum ReactionType
{
    Like,
    Dislike
}