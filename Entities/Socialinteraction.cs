namespace FabricIO_api.Entities;

public class Follow
{
    public Guid FollowerId { get; set; }
    public Guid FollowingId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //
    public User Follower { get; set; } = null!;
    public User Following { get; set; } = null!;
}

public class Block
{
    public Guid BlockerId { get; set; }
    public Guid BlockedId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //
    public User Blocker { get; set; } = null!;
    public User Blocked { get; set; } = null!;
}