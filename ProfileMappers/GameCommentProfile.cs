using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameCommentProfile : Profile
{
    public GameCommentProfile()
    {
        CreateMap<GameComment, GameCommentResponse>()
            .ForMember(dest => dest.Commentator, opt => opt.MapFrom(src => src.User));
    }
}
