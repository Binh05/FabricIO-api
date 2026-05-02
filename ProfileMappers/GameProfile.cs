using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameProfile : Profile
{
    public static string? _domain { get; set; }
    public GameProfile()
    {
        CreateMap<Game, Game>();
        CreateMap<GameRequestDto, Game>();
        CreateMap<Game, GameResponseDto>()
            .ForMember(dest => dest.GameTags, opt => opt.MapFrom(g => g.GameTagMaps))
            .ForMember(dest => dest.ThumbnailUrl, opt => opt.MapFrom(src => string.IsNullOrEmpty(src.ThumbnailUrl)
            ? null
            : $"{_domain}/{src.ThumbnailUrl}"));
        CreateMap<Game, GameRequestDto>();

        CreateMap<GamePlay, GamePlayDto>();

        CreateMap<Game, FeaturedGameRatingResponse>()
            .ForMember(dest => dest.Game, opt => opt.MapFrom(src => src))
            .ForMember(dest => dest.AverageRating, opt => opt.MapFrom(src => src.GameRatings.Any() ? 
            src.GameRatings.Average(r => (double)r.Stars): 0))
            .ForMember(dest => dest.TotalRating, opt => opt.MapFrom(src => src.GameRatings.Count()));
    }

}