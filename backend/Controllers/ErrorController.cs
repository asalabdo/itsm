using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ITSMBackend.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
public class ErrorController : ControllerBase
{
    [Route("/error")]
    public IActionResult HandleError()
    {
        var exceptionHandlerFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();
        var exception = exceptionHandlerFeature?.Error;

        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred",
            Detail = exception?.Message ?? "Unknown error",
            Instance = HttpContext.Request.Path
        };

        // Log the exception (in production, use proper logging)
        Console.WriteLine($"Error: {exception?.Message}");
        Console.WriteLine($"Stack Trace: {exception?.StackTrace}");

        return StatusCode(StatusCodes.Status500InternalServerError, problemDetails);
    }

    [Route("/error/{statusCode}")]
    public IActionResult HandleError(int statusCode)
    {
        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = GetTitleForStatusCode(statusCode),
            Instance = HttpContext.Request.Path
        };

        return StatusCode(statusCode, problemDetails);
    }

    private static string GetTitleForStatusCode(int statusCode)
    {
        return statusCode switch
        {
            400 => "Bad Request",
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            500 => "Internal Server Error",
            _ => "An error occurred"
        };
    }
}