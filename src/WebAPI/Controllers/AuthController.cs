using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleService _roleService;
    private readonly ISystemLogService _logService;

    public AuthController(IUserService userService, IRoleService roleService, ISystemLogService logService)
    {
        _userService = userService;
        _roleService = roleService;
        _logService = logService;
    }

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
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _userService.ValidateUserAsync(request.Username, request.Password);

        if (user == null)
        {
            return Unauthorized(new LoginResponse(false, "Kullanıcı adı veya şifre hatalı", null, null));
        }

        var role = await _roleService.GetByIdAsync(user.RoleId);
        if (role == null)
        {
            return Unauthorized(new LoginResponse(false, "Kullanıcı rolü bulunamadı", null, null));
        }

        // Permissions are already parsed in RoleDto
        var pagePermissions = role.PagePermissions ?? Array.Empty<string>();
        var entityPermissions = role.EntityPermissions ?? new Dictionary<string, string[]>();

        // Generate token
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());

        // Log the login
        await _logService.LogAsync(
            "Login", "User", user.Id, 
            "Sisteme giriş yapıldı", 
            user.Id, user.FullName, null);

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
    public async Task<ActionResult> Logout([FromHeader(Name = "X-User-Id")] int? userId)
    {
        if (userId.HasValue)
        {
             var user = await _userService.GetByIdAsync(userId.Value);
             if (user != null)
             {
                 await _logService.LogAsync(
                    "Logout", "User", user.Id, 
                    "Sistemden çıkış yapıldı", 
                    user.Id, user.FullName, null);
             }
        }
        return Ok(new { Success = true, Message = "Çıkış başarılı" });
    }

    [HttpGet("me")]
    public async Task<ActionResult> GetCurrentUser([FromHeader(Name = "X-User-Id")] int? userId)
    {
        if (userId == null)
        {
            return Unauthorized(new { Success = false, Message = "Kullanıcı bulunamadı" });
        }

        var user = await _userService.GetByIdAsync(userId.Value);
        // Check IsActive logic (UserDto has IsActive)
        if (user == null || !user.IsActive)
        {
            return NotFound(new { Success = false, Message = "Kullanıcı bulunamadı" });
        }

        var role = await _roleService.GetByIdAsync(user.RoleId);
        if (role == null)
        {
            return NotFound(new { Success = false, Message = "Rol bulunamadı" });
        }

        var pagePermissions = role.PagePermissions ?? Array.Empty<string>();
        var entityPermissions = role.EntityPermissions ?? new Dictionary<string, string[]>();

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
