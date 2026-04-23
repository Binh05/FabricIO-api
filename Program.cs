using FabricIO_api.DataAccess;
using FabricIO_api.Entities;
using FabricIO_api.Middleware;
using FabricIO_api.Services;
using FabricIO_api.UnitOfWork;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Minio;
using System.Net;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FabricIO API", Version = "v1" });

    // Định nghĩa scheme "Bearer"
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token vào ô bên dưới.\nVí dụ: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    });

    // Yêu cầu Bearer token cho các endpoint có [Authorize] (cú pháp Swashbuckle 10.x)
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});

// DbContext Config
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = Environment.GetEnvironmentVariable("ASPNETCORE_CONNECTION") 
                           ?? builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString);
});
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

//MinIO Config
var accessKey = Environment.GetEnvironmentVariable("ASPNETCORE_MINIO_ACCESSKEY") ?? builder.Configuration["Storage:AccessKey"];
var secretKeyMinio = Environment.GetEnvironmentVariable("ASPNETCORE_MINIO_SECRETKEY") ?? builder.Configuration["Storage:SecretKey"];
var endpoint = Environment.GetEnvironmentVariable("ASPNETCORE_MINIO_ENDPOINT") ?? builder.Configuration["Storage:EndPoint"];

builder.Services.AddMinio(configureClient => configureClient
    .WithEndpoint(endpoint)
    .WithCredentials(accessKey, secretKeyMinio)
    .WithSSL(false)
    .Build());

builder.Services.AddAutoMapper(config => {}, Assembly.GetExecutingAssembly());
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGameServices, GameService>();
builder.Services.AddScoped<IAuthServices, AuthServices>();
builder.Services.AddScoped<ISessionServices, SessionService>();
builder.Services.AddScoped<IStorageService, StorageServices>();
builder.Services.AddScoped<IGameTagService, GameTagService>();
builder.Services.AddScoped<IGameFavoriteService, GameFavoriteService>();
builder.Services.AddScoped<IGameCommentService, GameCommentService>();
builder.Services.AddScoped<IGameRatingService, GameRatingService>();
builder.Services.AddScoped<IGamePurchaseService, GamePurchaseService>();
builder.Services.Configure<AppSetting>(builder.Configuration.GetSection("AppSettings"));

var secretKey = builder.Configuration["AppSettings:SecretKey"];
var secretKeyBytes = Encoding.UTF8.GetBytes(secretKey!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opt =>
{
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(secretKeyBytes),
        RoleClaimType = ClaimTypes.Role
    };

    opt.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["token"];

            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }

            return Task.CompletedTask;
        }
    };
});

var corsName = "allowAll";

builder.Services.AddCors(opt =>
{
    opt.AddPolicy(corsName, policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(corsName);
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ExceptionMiddleware>();

app.MapControllers();

app.Run();
