package fabricio.backend.modules.users;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import fabricio.backend.modules.users.dtos.UserResponse;
import fabricio.backend.modules.users.entities.User;
import fabricio.backend.modules.users.internal.IUserInternalService;
import fabricio.backend.modules.users.internal.UserAuthDTO;

@Service
public class UserService implements IUserService, IUserInternalService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUserById(UUID id) {
        var entity = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));;

        return UserResponse.builder()
            .id(entity.getId())
            .username(entity.getUsername())
            .fullName(entity.getFullName())
            .email(entity.getEmail())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    @Override
    public List<User> getAllUser() {
        return userRepository.findAll();
    }

    @Override
    public Optional<UserAuthDTO> findByUsernameForAuth(String username) {
        return userRepository.findByUsername(username)
            .map(user -> new UserAuthDTO(user.getId(), user.getEmail(), user.getUsername(), user.getFullName(), user.getHashedPassword()));
    }

    @Override
    public UserAuthDTO createUserFromAuth(String username, String email, String fullName, String hashedPassword) {
        User entity = new User();
        entity.setUsername(username);
        entity.setHashedPassword(hashedPassword);
        entity.setEmail(email);
        entity.setFullName(fullName);

        var userSaved = userRepository.save(entity);

        return new UserAuthDTO(userSaved.getId(), userSaved.getEmail(), userSaved.getUsername(), userSaved.getFullName(), userSaved.getHashedPassword());
    }

    @Override
    public boolean exitsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}
