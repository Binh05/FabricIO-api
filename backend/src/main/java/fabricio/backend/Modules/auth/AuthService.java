package fabricio.backend.modules.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import fabricio.backend.modules.auth.dtos.LoginRequest;
import fabricio.backend.modules.auth.dtos.RegisterRequest;
import fabricio.backend.modules.users.internal.IUserInternalService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {
    private final IUserInternalService userInternalService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public String register(RegisterRequest req) {
        if (userInternalService.exitsByEmail(req.email())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        if (userInternalService.existsByUsername(req.username())) {
            throw new RuntimeException("Username đã được sử dụng!");
        }

        String hashPassword = passwordEncoder.encode(req.password());

        userInternalService.createUserFromAuth(req.username(), req.username(), req.fullName(), hashPassword);

        return "Đăng ký thành công";
    }

    @Override
    public String login(LoginRequest req) {
        var userExisting = userInternalService.findByUsernameForAuth(req.username())
        .orElseThrow(() -> new RuntimeException("Tài khoản hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(req.password(), userExisting.hashedPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không đúng");
        }

        return "Đăng nhập thành công";
    }
}
