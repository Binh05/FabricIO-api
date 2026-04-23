using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.DTOs;

public class GameCommentDto
{
    [Required]
    public required string Content { get; set; }
}

public class GameCommentResponse
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public required UserDisplay Commentator { get; set; }
    public required CommentResponse Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class UserDisplay
{
    public Guid? Id { get; set; }
    [EmailAddress]
    [Required]
    public required string Email { get; set; }
    public required string DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public required string Role { get; set; }
}

public class CommentResponse
{
    public Guid Id { get; set; }
    public required string Content { get; set; }
}

public class GameCommentPaginationResult : PaginationDto
{
    public int Total { get; set; }
    public required IEnumerable<GameCommentResponse> Items { get; set; }
}