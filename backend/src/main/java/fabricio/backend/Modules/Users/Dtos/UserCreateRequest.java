package fabricio.backend.modules.users.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {
    @NotBlank(message = "username không được để trống")
    public String username;

    @NotBlank(message = "password không được để trống")
    @Size(min = 6, message = "Mật khẩu ít nhất 6 ký tự")
    public String password;

    @NotBlank(message = "full name không được để trống")
    public String fullName;

    @NotBlank(message = "email không được để trống")
    @Email(message = "email không đúng định dạng")
    public String email;
}
