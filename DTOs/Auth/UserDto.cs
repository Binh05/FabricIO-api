using System.ComponentModel.DataAnnotations;

namespace FabricIO_api.DTOs;

public class UserResponse
{
    public Guid? Id { get; set; }
    [EmailAddress]
    [Required]
    public required string Email { get; set; }
    public required string Username { get; set; }
    public required string DisplayName { get; set; }
    public bool IsBanned { get; set; }
    public DateTime? BanExpiresAt { get; set; }
    public bool IsPostBanned { get; set; }
    public bool IsGameBanned { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string Role { get; set; } = "user";
}

public class UpdateUserDto
{
    public string? Bio { get; set; }
}

public class ChangePasswordDto
{
    [Required]
    public required string OldPassword { get; set; }
    [Required]
    public required string NewPassword { get; set; }
    [Required]
    public required string ConfirmPassword { get; set; }
}

public class UserRatedResponse
{
    public Guid RatingId { get; set; }
    public int Stars { get; set; }
    public required GameResponseDto Game { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateAccountBanDto
{
    public bool IsBanned { get; set; }
    public DateTime? BanExpiresAt { get; set; }
}

public class UpdatePostBanDto
{
    public bool IsPostBanned { get; set; }
}

public class UpdateGameBanDto
{
    public bool IsGameBanned { get; set; }
}