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
        }
    }
}