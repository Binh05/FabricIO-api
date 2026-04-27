using System.ComponentModel.DataAnnotations;
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
    public DateTime CreatedAt { get; set; }
    public UserDisplay? Author { get; set; }
    public IEnumerable<PostMediaDto> Media { get; set; } = [];
}

public class PostMediaDto
{
    public Guid Id { get; set; }
    public string MediaUrl { get; set; } = null!;
}
