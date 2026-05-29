package fabricio.backend.modules.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fabricio.backend.modules.auth.dtos.LoginRequest;
import fabricio.backend.modules.auth.dtos.RegisterRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth")
public class AuthController {
    private final IAuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        return authService.register(req);
    }
    
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }
}
