package fabricio.backend.modules.users;

import java.util.List;
import java.util.UUID;

import fabricio.backend.modules.users.dtos.UserResponse;
import fabricio.backend.modules.users.entities.User;

public interface IUserService {
    public UserResponse getUserById(UUID id);
    public List<User> getAllUser();
}
