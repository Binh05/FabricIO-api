using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.DTOs;

public class PostCommentDto
{
    [Required]
    public required string Content { get; set; }
}

public class PostCommentResponse
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public required UserDisplay Commentator { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PostCommentPaginationResult : PaginationDto
{
    public int Total { get; set; }
    public required IEnumerable<PostCommentResponse> Items { get; set; }
}
