namespace FabricIO_api.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set;}
    public Guid? SenderId { get; set; }
    public NotificationType Type { get; set; }
    public required string Message { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }  // "game", "post", "comment"
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    //
    public User Recipient { get; set; } = null!;
    public User? Sender { get; set; }
}

public enum NotificationType
{
    GameDeleted,
    PostDeleted,
    GamePurchased,
    NewFollower,
    NewGameComment,
    NewPostComment,
    AccountBanned,
    ContentBanned
}