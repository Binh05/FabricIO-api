using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.UnitOfWork;

namespace FabricIO_api.Services;

public class UserService(IUnitOfWork unitOfWork, IMapper mapper) : IUserService
{
    public async Task<IEnumerable<UserResponse>> GetAllAsync(UserRole role, CancellationToken token)
    {
        if (role != UserRole.Admin)
        {
            throw new ForbidException("Không có quyền gọi api");
        }

        return await unitOfWork.Users.GetAllAsync<UserResponse>(token);
    }
    public async Task UpdateAvatarAsync(Guid userId, string avatarUrl, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetByIdAsync<User>(userId, token);

        if (user == null)
        {
            throw new NotFoundException("User không tồn tại");
        }

        user.AvatarUrl = avatarUrl;

        unitOfWork.Users.Update(user);
        await unitOfWork.SaveAsync(token);
    }
    public async Task<UserResponse> GetByIdAsync(Guid userId, CancellationToken token)
    {
        var user = await unitOfWork.Users.GetByIdAsync<UserResponse>(userId, token);

        if (user == null)
        {
            throw new NotFoundException("User khong ton tai");
        }

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
    public async Task<IEnumerable<GameCardDto>> GetGamePaidAsync(Guid userId, CancellationToken token)
    {
        var data = await unitOfWork.GamePurchases.GetListAsync<GameCardDto>(p => p.BuyerId == userId, token);

        return data;
    }

    public async Task<IEnumerable<GameCardDto>> GetGameFavoritesAsync(Guid userId, CancellationToken token)
    {
        var data = await unitOfWork.GameFavorites.GetListAsync<GameCardDto>(p => p.UserId == userId, token);

        return data;
    }

    public async Task<IEnumerable<GameCardDto>> GetMyGameAsync(Guid userId, CancellationToken token)
    {
        return await unitOfWork.Games.GetListAsync<GameCardDto>(g => g.OwnerId == userId, token);
    }

    public async Task<string> BanUploadGame(Guid userId, UserRole adminRole, CancellationToken token)
    {
        if (adminRole != UserRole.Admin)
        {
            throw new ForbidException("Không có quyền cấm người chơi khác");
        }

        var user = await unitOfWork.Users.GetEntityAsync(u => u.Id == userId, token);
        if (user == null)
        {
            throw new NotFoundException("User bị ban không tồn tại");
        }

        user.IsGameBanned = true;
        unitOfWork.Users.Update(user);
        await unitOfWork.SaveAsync(token);

        return user.Username;
    }
}