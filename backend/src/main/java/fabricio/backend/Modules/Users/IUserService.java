package fabricio.backend.Modules.Users;

import fabricio.backend.Modules.Users.Dtos.UserCreateRequest;
import fabricio.backend.Modules.Users.Dtos.UserResponse;

public interface IUserService {
    public String printHello(String name);
    public UserResponse signup(UserCreateRequest req);
}
