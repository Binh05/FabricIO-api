using FabricIO_api.Enums;

namespace FabricIO_api.DTOs;

public class PostReactRequestDto
{
    public Guid PostId { get; set; }
    public ReactionType ReactionType { get; set; }
}