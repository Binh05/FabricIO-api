using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameFavoriteProfile: Profile
{
    public GameFavoriteProfile()
    {
        CreateMap<GameFavorite, GameResponseDto>()
            .IncludeMembers(src => src.Game)
            .ForMember(dest => dest.IsFavorite, opt => opt.MapFrom(src => true));
    }
}