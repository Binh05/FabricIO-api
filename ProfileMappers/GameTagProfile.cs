using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameTagProfile : Profile
{
    public GameTagProfile()
    {
        CreateMap<GameTag, GameTagResponse>().ReverseMap();
        CreateMap<GameTag, GameTag>();
        CreateMap<GameTagRequest, GameTag>();
        CreateMap<GameTagMap, GameTagResponse>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(m => m.Tag.Id))
            .ForMember(dest => dest.Name, opt => opt.MapFrom(m => m.Tag.Name));
    }
}
