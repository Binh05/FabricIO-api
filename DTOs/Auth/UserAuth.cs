using System.ComponentModel.DataAnnotations;

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

