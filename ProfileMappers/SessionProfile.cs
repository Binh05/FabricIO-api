using AutoMapper;
using FabricIO_api.Entities;

namespace FabricIO_api.ProfileMappers;

public class SessionProfile : Profile
{
    public SessionProfile()
    {
        CreateMap<Session, Session>();
    }
}