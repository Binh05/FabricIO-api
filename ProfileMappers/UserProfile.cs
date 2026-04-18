using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<UserResponse, User>().ReverseMap();

        CreateMap<UserRegister, User>().ForMember(dest => dest.HashedPassword, opt => opt.MapFrom(src => src.Password));

        CreateMap<Game, GameDto>().ReverseMap();
    }
}