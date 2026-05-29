package fabricio.backend.modules.users.internal;

import java.util.Optional;

public interface IUserInternalService {
    Optional<UserAuthDTO> findByUsernameForAuth(String username);
    UserAuthDTO createUserFromAuth(String username, String email, String fullName, String hashedPassword);
    boolean exitsByEmail(String email);
    boolean existsByUsername(String username);
}
