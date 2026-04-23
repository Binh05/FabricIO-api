using AutoMapper;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class GamePurchaseProfile : Profile
{
    public GamePurchaseProfile()
    {
        CreateMap<GamePurchase, GamePurchaseResponse>();
    }
}
