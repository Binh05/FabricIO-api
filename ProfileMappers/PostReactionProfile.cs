using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;
public class PostReactionProfile : Profile
{
    public PostReactionProfile()
    {
        CreateMap<PostReactRequestDto, PostReaction>();
    }
}