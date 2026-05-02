using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class UserService(IUnitOfWork unitOfWork, IMapper mapper, IStorageService storageService) : IUserService
{
    public async Task<IEnumerable<UserResponse>> GetAllAsync(UserRole role, CancellationToken token)
    {
        if (role != UserRole.Admin)
        {
            throw new ForbidException("Không có quyền gọi api");
        }

        return await unitOfWork.Users.GetAllAsync<UserResponse>(token);
    }
    public async Task<string> UpdateAvatarAsync(Guid userId, IFormFile imgFile, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (user == null)
        {
            throw new NotFoundException("User không tồn tại");
        }

        var avatarUrl = await storageService.UploadFileAsync(imgFile, "file", userId.ToString(), token);
        if (avatarUrl == null)
        {
            throw new BadRequestException("Upload avatar khong thanh cong");
        }

        user.AvatarUrl = avatarUrl;

        unitOfWork.Users.Update(user);
        await unitOfWork.SaveAsync(token);

        return storageService.GetPublicUrl(avatarUrl);
    }
    public async Task<UserResponse> GetByIdAsync(Guid userId, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetByIdAsync<UserResponse>(userId, token);

        if (user == null)
        {
            throw new NotFoundException("User khong ton tai");
        }

        if (user.AvatarUrl != null)
            user.AvatarUrl = storageService.GetPublicUrl(user.AvatarUrl);

        return user;
    }

    public async Task<UserResponse> UpdateProfileAsync(Guid userId, UpdateUserDto user, CancellationToken token)
    {
        var userExisting = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);

        if (userExisting == null)
        {
            throw new NotFoundException("User khong ton tai");
        }

        if (user.Bio is not null) 
            userExisting.Bio = user.Bio;

        await unitOfWork.SaveAsync(token);
        return mapper.Map<UserResponse>(userExisting);
    }

    public async Task<User> CheckUserExistingAsync(Guid userId, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);

        if (user == null)
        {
            throw new NotFoundException("User không tồn tại");
        }

        return user;
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto passwordDto, CancellationToken token)
    {
        var user = await this.CheckUserExistingAsync(userId, token);

        var isCorrect = BCrypt.Net.BCrypt.Verify(passwordDto.OldPassword, user.HashedPassword);

        if (!isCorrect)
        {
            throw new BadRequestException("Mật khẩu không đúng");
        }

        if (passwordDto.NewPassword != passwordDto.ConfirmPassword)
        {
            throw new BadRequestException("Mật khẩu mới không trùng nhau");
        }

        user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(passwordDto.NewPassword);
        await unitOfWork.SaveAsync(token);
    }
    public async Task<IEnumerable<UserRatedResponse>> GetRatingsAsync(Guid userId, CancellationToken token)
    {
        var data = await unitOfWork.GameRatings.GetListAsync<UserRatedResponse>(r => r.UserId == userId, token);

        return data;
    }
    public async Task<IEnumerable<GameResponseDto>> GetGamePaidAsync(Guid userId, CancellationToken token)
    {
        var data = await unitOfWork.GamePurchases.GetListAsync<GameResponseDto>(p => p.BuyerId == userId, token);

        return data;
    }

    public async Task<IEnumerable<GameResponseDto>> GetGameFavoritesAsync(Guid userId, CancellationToken token)
    {
        var data = await unitOfWork.GameFavorites.GetListAsync<GameResponseDto>(p => p.UserId == userId, token);

        return data;
    }

    public async Task<IEnumerable<GameResponseDto>> GetMyGameAsync(Guid userId, CancellationToken token)
    {
        return await unitOfWork.Games.GetListAsync<GameResponseDto>(g => g.OwnerId == userId, token);
    }

    public async Task<string> UpdateGameBannedAsync(Guid userId, bool isGameBanned, UserRole adminRole, CancellationToken token)
    {
        if (adminRole != UserRole.Admin)
        {
            throw new ForbidException("Không có quyền thực hiện thao tác này");
        }

        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (user == null)
        {
            throw new NotFoundException("User không tồn tại");
        }

        user.IsGameBanned = isGameBanned;
        unitOfWork.Users.Update(user);
        await unitOfWork.SaveAsync(token);

        return user.Username;
    }

    public async Task<string> UpdateBannedAsync(Guid userId, bool isBanned, DateTime? banExpiresAt, UserRole adminRole, CancellationToken token)
    {
        if (adminRole != UserRole.Admin)
        {
            throw new ForbidException("Không có quyền thực hiện thao tác này");
        }

        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (user == null)
        {
            throw new NotFoundException("User không tồn tại");
        }

        user.IsBanned = isBanned;
        user.BanExpiresAt = banExpiresAt;
        
        unitOfWork.Users.Update(user);
        await unitOfWork.SaveAsync(token);

        return user.Username;
    }

    public async Task<string> UpdatePostBannedAsync(Guid userId, bool isPostBanned, UserRole adminRole, CancellationToken token)
    {
        if (adminRole != UserRole.Admin)
        {
            throw new ForbidException("Không có quyền thực hiện thao tác này");
        }

        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (user == null)
        {
            throw new NotFoundException("User không tồn tại");
        }

        user.IsPostBanned = isPostBanned;
        
        unitOfWork.Users.Update(user);
        await unitOfWork.SaveAsync(token);

        return user.Username;
    }
}