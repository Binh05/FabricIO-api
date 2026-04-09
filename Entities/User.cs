using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.Entities;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    [EmailAddress]
    [Required]
    public required string Email { get; set; }
    public required string Username { get; set; }
    public required string HashedPassword { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = "user";
    public string? OTP { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}