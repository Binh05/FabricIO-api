package fabricio.backend.modules.auth.dtos;

public record RegisterRequest(String email, String username, String fullName, String password) {
    
}
