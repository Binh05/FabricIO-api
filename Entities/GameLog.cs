namespace FabricIO_api.Entities;

public class GamePlay
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid GameId { get; set; }
    public DateTime PlayedAt { get; set; }

    //
    public User User { get; set; } = null!;
    public Game Game { get; set; } = null!;
}