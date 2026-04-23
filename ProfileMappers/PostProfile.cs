using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class PostProfile : Profile
{
    public PostProfile()
    {
        CreateMap<PostRequestDto, Post>()
            .ForMember(dest => dest.Media, opt => opt.Ignore());
        CreateMap<Post, PostResponseDto>()
            .ForMember(dest => dest.Media, opt => opt.MapFrom(src => src.Media));
        CreateMap<PostMedia, PostMediaDto>();
    }
}
