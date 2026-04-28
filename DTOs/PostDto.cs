using System.ComponentModel.DataAnnotations;
using FabricIO_api.Enums;
using Microsoft.AspNetCore.Http;

namespace FabricIO_api.DTOs;

public class PostRequestDto
{
    [Required]
    public string Title { get; set; } = null!;
    
    [Required]
    public string Content { get; set; } = null!;
    
    public List<IFormFile>? MediaFiles { get; set; }
}

public class PostResponseDto
{
    public Guid Id { get; set; }
    public Guid AuthorId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public int CommentCount { get; set; }
    public ReactionType? MyReaction { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDisplay? Author { get; set; }
    public IEnumerable<PostMediaDto> Media { get; set; } = [];
}

public class PostMediaDto
{
    public Guid Id { get; set; }
    public string MediaUrl { get; set; } = null!;
}

public class PostPaginationResult : PaginationDto
{
    public int Total { get; set; }
    public IEnumerable<PostResponseDto> Items { get; set; } = [];
}

public class UpdatePostRequestDto
{
    [Required]
    public string Title { get; set; } = null!;
    
    [Required]
    public string Content { get; set; } = null!;
    
    public List<Guid>? DeletedImageIds { get; set; }
    public List<IFormFile>? NewImages { get; set; }
}
