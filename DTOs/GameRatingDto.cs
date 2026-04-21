namespace FabricIO_api.DTOs;

public class GameRatingResponse
{
    public int Total { get; set; }
    public double Average { get; set; }
    //public IEnumerable<UserRatingDisplay> UserRating { get; set; } = [];
}

public class RatingRequest {
    public int Stars { get; set; }
}

public class UserRatedResponse
{
    public Guid RatingId { get; set; }
    public int Stars { get; set; }
    public Guid GameId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserRatingDisplay
{
    public UserDisplay User { get; set; } = default!;
    public Guid RatingId { get; set; }
    public int Stars { get; set; }
    public DateTime RatedAt { get; set; }
}
