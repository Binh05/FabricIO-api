using AutoMapper;
using AutoMapper.QueryableExtensions;
using FabricIO_api.DataAccess;
using FabricIO_api.DTOs;
using FabricIO_api.Entities;
using FabricIO_api.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace FabricIO_api.Services;

public class UserService(IUnitOfWork uof, IMapper mapper) : IUserService
{
    
}