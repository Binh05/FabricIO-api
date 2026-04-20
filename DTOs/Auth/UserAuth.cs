using System.ComponentModel.DataAnnotations;
using FabricIO_api.Entities;

namespace FabricIO_api.DTOs;

public class UserLogin
{
    [Required]
    public required string Username { get; set; }

    [Required]
    [MinLength(6, ErrorMessage = "Mật khẩu ít nhất 6 ký tự")]
    public required string Password { get; set; }
}

public class UserRegister : UserLogin
{
    [Required]
    public required string DisplayName { get; set; }
    [Required]
    [EmailAddress]
    public required string Email { get; set; }
}

public class UserBaseDto
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string HashedPassword { get; set; }
    public required string DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public bool IsBanned { get; set; }
    public DateTime? BanExpiresAt { get; set; }
    public bool IsPostBanned { get; set; }
    public bool IsGameBanned { get; set; }
    public decimal Balance { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}