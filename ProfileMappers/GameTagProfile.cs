using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameTagProfile : Profile
{
    public GameTagProfile()
    {
        CreateMap<GameTag, GameTagResponse>().ReverseMap();
        CreateMap<GameTagRequest, GameTag>();
    }
}
