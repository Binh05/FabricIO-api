using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.DTOs;

public class UserDto
{
    [EmailAddress]
    [Required]
    public required string Email { get; set; }
    public required string Username { get; set; }
    public required string Password { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = "user";
    public string? OTP { get; set; }
}