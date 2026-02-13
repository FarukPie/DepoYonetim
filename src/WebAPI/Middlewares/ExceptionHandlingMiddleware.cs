using System.Net;
using System.Text.Json;
using DepoYonetim.Core.Exceptions;

namespace DepoYonetim.WebAPI.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new { message = exception.Message };
        
        switch (exception)
        {
            case BusinessException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;
            default:
                _logger.LogError(exception, "An unhandled exception occurred.");
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response = new { message = "An internal server error occurred." };
                break;
        }

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
