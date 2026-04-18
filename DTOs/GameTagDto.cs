using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.DTOs;

public class GameTagResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
}

public class GameTagRequest
{
    [Required]
    public required string Name { get; set; }
}