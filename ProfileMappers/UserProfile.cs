using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserResponse>().ForMember(dest => dest.Password, opt => opt.Ignore());

        CreateMap<UserResponse, User>().ForMember(
            desk => desk.HashedPassword,
            opt => opt.MapFrom(src => src.Password)
        ).ReverseMap();

        CreateMap<UserRegister, User>().ForMember(dest => dest.HashedPassword, opt => opt.MapFrom(src => src.Password));

        CreateMap<Game, GameDto>().ReverseMap();
    }
}