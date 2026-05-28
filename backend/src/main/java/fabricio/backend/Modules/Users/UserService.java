package fabricio.backend.Modules.Users;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fabricio.backend.Modules.Users.Dtos.UserCreateRequest;
import fabricio.backend.Modules.Users.Dtos.UserResponse;
import fabricio.backend.Modules.Users.Entity.User;

@Service
public class UserService implements IUserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String printHello(String name) {
        return "Hello " + name;
    }

    @Transactional
    public UserResponse signup(UserCreateRequest req) {
        User user = new User();
        user.setUsername(req.username);
        user.setHashedPassword(req.password);
        user.setEmail(req.email);
        user.setFullName(req.fullName);

        var userSaved = userRepository.save(user);

        return UserResponse.builder()
            .id(userSaved.getId())
            .username(userSaved.getUsername())
            .fullName(userSaved.getFullName())
            .email(userSaved.getEmail())
            .createdAt(userSaved.getCreatedAt())
            .updatedAt(userSaved.getUpdatedAd())
            .build();
    } 
}
