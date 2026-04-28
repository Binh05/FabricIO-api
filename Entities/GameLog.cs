namespace FabricIO_api.Entities;

public class GamePlay
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid GameId { get; set; }
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;

    //
    public User User { get; set; } = null!;
    public Game Game { get; set; } = null!;
}

public class GamePlayDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid GameId { get; set; }
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;

 
}