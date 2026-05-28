# Project Structure
src/main/java/fabricio/backend/
├── modules/
│   ├── users/
│   │   ├── UserController.java
│   │   ├── IUserService.java
│   │   ├── UserService.java
│   │   ├── UserRepository.java
│   │   ├── entities/
│   │   │   └── UserEntity.java
│   │   ├── dtos/
│   │   │   ├── UserRequest.java
│   │   │   └── UserResponse.java
│   │   ├── mappers/
│   │   └── internal/            <-- CHỖ MỚI: Cung cấp data bảo mật cho module khác
│   │       ├── UserAuthDTO.java <-- DTO tối giản (id, email, password, roles) chỉ dùng cho Auth
│   │       └── UserInternalService.java (hoặc Spring Security UserDetailsService)
│   │
│   └── auth/
│       ├── AuthController.java   (Đăng nhập, Đăng ký, Refresh Token)
│       ├── IAuthService.java
│       ├── AuthService.java       (Xử lý logic so khớp pass, tạo JWT)
│       ├── dtos/
│       │   ├── LoginRequest.java
│       │   └── TokenResponse.java (Chứa access_token, refresh_token)
│       └── jwt/                  <-- Các class xử lý Token (JwtTokenProvider/Filter)
│           ├── JwtAuthenticationFilter.java
│           └── JwtTokenProvider.java
│
├── shared/
│   ├── exceptions/
│   │   ├── GlobalExceptionHandler.java
│   │   └── AppCustomException.java
│   ├── configs/
│   │   ├── DatabaseConfig.java
│   │   └── SecurityConfig.java   <-- Nơi cấu hình bọc Spring Security (vẫn để ở Shared)
│   └── base/
│       ├── BaseEntity.java       (id, createdAt, updatedAt, ...)
│       └── BaseResponse.java
│
└── BackendApplication.java