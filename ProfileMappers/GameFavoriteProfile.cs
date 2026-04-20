using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GameFavoriteProfile: Profile
{
    public GameFavoriteProfile()
    {
        CreateMap<GameFavorite, GameFavoriteResponse>();
    }
}