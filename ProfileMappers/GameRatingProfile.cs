using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers
{
    public class GameRatingProfile : Profile
    {
        public GameRatingProfile()
        {
            CreateMap<Game, GameRatingResponse>();
            CreateMap<GameRating, UserRatedResponse>()
                .ForMember(dest => dest.RatingId, opt => opt.MapFrom(src => src.Id));
        }
    }
}