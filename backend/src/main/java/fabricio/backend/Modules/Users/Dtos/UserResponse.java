package fabricio.backend.modules.users.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    public UUID id;
    public String username;
    public String email;
    public String fullName;
    public String bio;
    public String avatarUrl;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
