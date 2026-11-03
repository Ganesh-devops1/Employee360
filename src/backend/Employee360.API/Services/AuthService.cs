using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Employee360.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace Employee360.API.Services;

public interface IAuthService
{
    string GenerateJwtToken(User user);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Key"] ?? "Employee360_Super_Secret_Demo_Key_2026_Secure!";
        var issuer = _configuration["Jwt:Issuer"] ?? "Employee360";
        var audience = _configuration["Jwt:Audience"] ?? "Employee360App";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("FullName", user.FullName),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
