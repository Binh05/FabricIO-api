using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.DTOs;

public class CreateGameComment
{
    [Required]
    public required string Content { get; set; }
}

public class GameCommentResponse
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public required UserResponse Commentator { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GameCommentPagination : PaginationDto
{
    [Required]
    public Guid GameId { get; set; }
}

public class GameCommentPaginationResult : PaginationDto
{
    public int Total { get; set; }
    public required IEnumerable<GameCommentResponse> Items { get; set; }
}