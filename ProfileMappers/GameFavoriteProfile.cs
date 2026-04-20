using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameFavoriteProfile: Profile
{
    public GameFavoriteProfile()
    {
        CreateMap<GameFavorite, GameFavoriteResponse>()
            .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Game.Title))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Game.Description))
            .ForMember(dest => dest.ThumbnailUrl, opt => opt.MapFrom(src => src.Game.ThumbnailUrl))
            .ForMember(dest => dest.GameType, opt => opt.MapFrom(src => src.Game.GameType))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Game.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.Game.UpdatedAt));
    }
}