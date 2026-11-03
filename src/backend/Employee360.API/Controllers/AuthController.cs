using Employee360.API.Data;
using Employee360.API.Models;
using Employee360.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Employee360.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;

    public AuthController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());
        
        // Demo credentials check (plain check or seeded hash)
        if (user == null || user.PasswordHash != request.Password)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = _authService.GenerateJwtToken(user);

        return Ok(new LoginResponse(token, user.Username, user.FullName, user.Role));
    }
}
