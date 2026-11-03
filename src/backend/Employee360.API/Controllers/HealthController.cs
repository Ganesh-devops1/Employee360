using Employee360.API.Data;
using Microsoft.AspNetCore.Mvc;

namespace Employee360.API.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public HealthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpGet("live")]
    public IActionResult Liveness()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow,
            service = "Employee360.API"
        });
    }

    [HttpGet("ready")]
    public async Task<IActionResult> Readiness()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (canConnect)
            {
                return Ok(new
                {
                    status = "Ready",
                    database = "Connected",
                    environment = _config["ASPNETCORE_ENVIRONMENT"] ?? "Development",
                    version = "1.0.0-phase1",
                    timestamp = DateTime.UtcNow
                });
            }

            return StatusCode(503, new { status = "Degraded", database = "Unavailable" });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new { status = "Unhealthy", error = ex.Message });
        }
    }

    [HttpGet("info")]
    public IActionResult Info()
    {
        return Ok(new
        {
            application = "Employee360 Enterprise HR Platform",
            version = "1.0.0",
            dotnetVersion = Environment.Version.ToString(),
            osDescription = System.Runtime.InteropServices.RuntimeInformation.OSDescription,
            timestamp = DateTime.UtcNow
        });
    }
}
