namespace FabricIO_api.Entities;

public class GameTag
{
    public Guid Id { get; set; }
    public required string Name { get; set; }

    //
    public ICollection<GameTagMap> GameTagMaps { get; set; } = new List<GameTagMap>();
}

public class GameTagMap
{
    public Guid GameId { get; set; }
    public Guid TagId { get; set; }

    //
    public Game Game { get; set; } = null!;
    public GameTag Tag { get; set; } = null!;
}