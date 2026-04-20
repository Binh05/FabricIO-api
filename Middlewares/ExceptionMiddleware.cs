namespace FabricIO_api.Middleware;

public class ExceptionMiddleware(RequestDelegate next) 
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            context.Response.StatusCode = ex.StatusCode;
            context.Response.ContentType = "Application/json";

            await context.Response.WriteAsJsonAsync(new
            {
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            context.Response.ContentType = "Application/json";

            await context.Response.WriteAsJsonAsync(new
            {
                message = ex.Message,
                detail = ex.StackTrace
            });
        }
    }
}
public class AppException : Exception
{
    public int StatusCode { get; }
    public AppException(string? message, int statusCode)
        : base(message ?? GetDefaultMessage(statusCode))
    {
        StatusCode = statusCode;
    }
    private static string GetDefaultMessage(int statusCode)
    {
        return statusCode switch
        {
            StatusCodes.Status400BadRequest => "Bad request",
            StatusCodes.Status401Unauthorized => "Unauthorized",
            StatusCodes.Status403Forbidden => "Forbidden",
            StatusCodes.Status404NotFound => "Resource not found",
            StatusCodes.Status409Conflict => "Conflict",
            _ => "An error occurred"
        };
    }
}

public class BadRequestException : AppException
{
    public BadRequestException(string? message = null) : base(message, 400) {}
}

public class UnauthorizedException: AppException
{
    public UnauthorizedException(string? message = null) : base(message, 401) {}
}

public class NotFoundException: AppException
{
    public NotFoundException(string? message = null) : base(message, 404) {}
}

public class ForbidException: AppException
{
    public ForbidException(string? message = null) : base(message, 403) {}
}

public class ConflictException: AppException
{
    public ConflictException(string? message = null) : base(message, 409) {}
}