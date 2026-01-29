using DepoYonetim.Core.Entities;
using DepoYonetim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    public record UserDto(
        int Id,
        string Username,
        string Email,
        string FullName,
        int RoleId,
        string RoleName,
        bool IsActive,
        DateTime CreatedAt
    );

    public record CreateUserRequest(
        string Username,
        string Password,
        string Email,
        string FullName,
        int RoleId
    );

    public record UpdateUserRequest(
        string? Email,
        string? FullName,
        int? RoleId,
        bool? IsActive,
        string? Password
    );

    [HttpGet]
    public ActionResult<IEnumerable<UserDto>> GetAll()
    {
        var users = MockData.Users.Select(u => new UserDto(
            u.Id,
            u.Username,
            u.Email,
            u.FullName,
            u.RoleId,
            MockData.Roller.FirstOrDefault(r => r.Id == u.RoleId)?.Name ?? "Bilinmiyor",
            u.IsActive,
            u.CreatedAt
        )).ToList();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public ActionResult<UserDto> GetById(int id)
    {
        var user = MockData.Users.FirstOrDefault(u => u.Id == id);
        if (user == null)
        {
            return NotFound(new { Message = "Kullanıcı bulunamadı" });
        }

        return Ok(new UserDto(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.RoleId,
            MockData.Roller.FirstOrDefault(r => r.Id == user.RoleId)?.Name ?? "Bilinmiyor",
            user.IsActive,
            user.CreatedAt
        ));
    }

    [HttpPost]
    public ActionResult<UserDto> Create([FromBody] CreateUserRequest request)
    {
        // Check if username already exists
        if (MockData.Users.Any(u => u.Username == request.Username))
        {
            return BadRequest(new { Message = "Bu kullanıcı adı zaten kullanılıyor" });
        }

        var newUser = new User
        {
            Id = MockData.Users.Count > 0 ? MockData.Users.Max(u => u.Id) + 1 : 1,
            Username = request.Username,
            Password = request.Password,
            Email = request.Email,
            FullName = request.FullName,
            RoleId = request.RoleId,
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        MockData.Users.Add(newUser);

        // Log the action
        MockData.SystemLogs.Add(new SystemLog
        {
            Id = MockData.SystemLogs.Count > 0 ? MockData.SystemLogs.Max(l => l.Id) + 1 : 1,
            Action = "Create",
            EntityType = "User",
            EntityId = newUser.Id,
            Details = $"Yeni kullanıcı oluşturuldu: {newUser.FullName}",
            Timestamp = DateTime.Now
        });

        return CreatedAtAction(nameof(GetById), new { id = newUser.Id }, new UserDto(
            newUser.Id,
            newUser.Username,
            newUser.Email,
            newUser.FullName,
            newUser.RoleId,
            MockData.Roller.FirstOrDefault(r => r.Id == newUser.RoleId)?.Name ?? "Bilinmiyor",
            newUser.IsActive,
            newUser.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public ActionResult<UserDto> Update(int id, [FromBody] UpdateUserRequest request)
    {
        var user = MockData.Users.FirstOrDefault(u => u.Id == id);
        if (user == null)
        {
            return NotFound(new { Message = "Kullanıcı bulunamadı" });
        }

        if (request.Email != null) user.Email = request.Email;
        if (request.FullName != null) user.FullName = request.FullName;
        if (request.RoleId.HasValue) user.RoleId = request.RoleId.Value;
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
        if (!string.IsNullOrEmpty(request.Password)) user.Password = request.Password;

        // Log the action
        MockData.SystemLogs.Add(new SystemLog
        {
            Id = MockData.SystemLogs.Count > 0 ? MockData.SystemLogs.Max(l => l.Id) + 1 : 1,
            Action = "Update",
            EntityType = "User",
            EntityId = user.Id,
            Details = $"Kullanıcı güncellendi: {user.FullName}",
            Timestamp = DateTime.Now
        });

        return Ok(new UserDto(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.RoleId,
            MockData.Roller.FirstOrDefault(r => r.Id == user.RoleId)?.Name ?? "Bilinmiyor",
            user.IsActive,
            user.CreatedAt
        ));
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        var user = MockData.Users.FirstOrDefault(u => u.Id == id);
        if (user == null)
        {
            return NotFound(new { Message = "Kullanıcı bulunamadı" });
        }

        MockData.Users.Remove(user);

        // Log the action
        MockData.SystemLogs.Add(new SystemLog
        {
            Id = MockData.SystemLogs.Count > 0 ? MockData.SystemLogs.Max(l => l.Id) + 1 : 1,
            Action = "Delete",
            EntityType = "User",
            EntityId = id,
            Details = $"Kullanıcı silindi: {user.FullName}",
            Timestamp = DateTime.Now
        });

        return NoContent();
    }
}
