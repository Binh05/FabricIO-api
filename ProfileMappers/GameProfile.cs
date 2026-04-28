using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameProfile: Profile
{
    public GameProfile()
    {
        CreateMap<Game, Game>();
        CreateMap<GameRequestDto, Game>();
        CreateMap<Game, GameResponseDto>().ForMember(dest => dest.GameTags, opt => opt.MapFrom(g => g.GameTagMaps));
        CreateMap<Game, GameRequestDto>();

        CreateMap<Game, GameCardDto>();
        CreateMap<GamePlay, GamePlayDto>();
    }

}