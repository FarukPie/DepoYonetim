using DepoYonetim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    public record LoginRequest(string Username, string Password);
    public record LoginResponse(
        bool Success, 
        string? Message, 
        string? Token, 
        UserInfo? User
    );
    public record UserInfo(
        int Id, 
        string Username, 
        string FullName, 
        string Email,
        int RoleId,
        string RoleName,
        string[] PagePermissions,
        Dictionary<string, string[]> EntityPermissions
    );

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var user = MockData.Users.FirstOrDefault(u => 
            u.Username == request.Username && 
            u.Password == request.Password &&
            u.IsActive);

        if (user == null)
        {
            return Unauthorized(new LoginResponse(false, "Kullanıcı adı veya şifre hatalı", null, null));
        }

        var role = MockData.Roller.FirstOrDefault(r => r.Id == user.RoleId);
        if (role == null)
        {
            return Unauthorized(new LoginResponse(false, "Kullanıcı rolü bulunamadı", null, null));
        }

        // Parse permissions from JSON
        var pagePermissions = System.Text.Json.JsonSerializer.Deserialize<string[]>(role.PagePermissions) ?? Array.Empty<string>();
        var entityPermissions = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string[]>>(role.EntityPermissions) ?? new Dictionary<string, string[]>();

        // Generate token
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());

        // Log the login
        var log = new Core.Entities.SystemLog
        {
            Id = MockData.SystemLogs.Count > 0 ? MockData.SystemLogs.Max(l => l.Id) + 1 : 1,
            UserId = user.Id,
            UserName = user.FullName,
            Action = "Login",
            EntityType = "User",
            Details = "Sisteme giriş yapıldı",
            Timestamp = DateTime.Now
        };
        MockData.SystemLogs.Add(log);

        var userInfo = new UserInfo(
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            role.Id,
            role.Name,
            pagePermissions,
            entityPermissions
        );

        return Ok(new LoginResponse(true, "Giriş başarılı", token, userInfo));
    }

    [HttpPost("logout")]
    public ActionResult Logout()
    {
        return Ok(new { Success = true, Message = "Çıkış başarılı" });
    }

    [HttpGet("me")]
    public ActionResult GetCurrentUser([FromHeader(Name = "X-User-Id")] int? userId)
    {
        if (userId == null)
        {
            return Unauthorized(new { Success = false, Message = "Kullanıcı bulunamadı" });
        }

        var user = MockData.Users.FirstOrDefault(u => u.Id == userId && u.IsActive);
        if (user == null)
        {
            return NotFound(new { Success = false, Message = "Kullanıcı bulunamadı" });
        }

        var role = MockData.Roller.FirstOrDefault(r => r.Id == user.RoleId);
        if (role == null)
        {
            return NotFound(new { Success = false, Message = "Rol bulunamadı" });
        }

        var pagePermissions = System.Text.Json.JsonSerializer.Deserialize<string[]>(role.PagePermissions) ?? Array.Empty<string>();
        var entityPermissions = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string[]>>(role.EntityPermissions) ?? new Dictionary<string, string[]>();

        return Ok(new UserInfo(
            user.Id,
            user.Username,
            user.FullName,
            user.Email,
            role.Id,
            role.Name,
            pagePermissions,
            entityPermissions
        ));
    }
}
