package fabricio.backend.modules.users.internal;

import java.util.UUID;

public record UserAuthDTO(UUID id, String email, String username, String fullname, String hashedPassword) {
    
}
