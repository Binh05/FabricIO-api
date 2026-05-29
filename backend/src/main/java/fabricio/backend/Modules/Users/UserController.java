package fabricio.backend.modules.users;

import org.springframework.web.bind.annotation.RestController;

import fabricio.backend.modules.users.dtos.UserResponse;
import fabricio.backend.modules.users.entities.User;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "User", description = "Các api quản lý user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return userService.getUserById(id);
    }

    @GetMapping("/user")
    public List<User> getAllUser() {
        return userService.getAllUser();
    }
}
