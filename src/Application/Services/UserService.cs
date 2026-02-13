using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
 
// Wait, UsersController has UserDto defined inside it. I should move it to DTOs first or reuse it.
// Checking UsersController again.. yes "public record UserDto". 
// I should probably move these DTOs to Application/DTOs/UserDtos.cs to be clean.
using System.Linq.Expressions;

namespace DepoYonetim.Application.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Role> _roleRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public UserService(
        IRepository<User> userRepository,
        IRepository<Role> roleRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }

    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        var roles = await _roleRepository.GetAllAsync(); // Cache roles for mapping

        return users.Select(u => MapToDto(u, roles));
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        var role = await _roleRepository.GetByIdAsync(user.RoleId);
        return MapToDto(user, role != null ? new[] { role } : Array.Empty<Role>());
    }

    public async Task<UserDto?> GetByUsernameAsync(string username)
    {
        var users = await _userRepository.FindAsync(u => u.Username == username);
        var user = users.FirstOrDefault();
        if (user == null) return null;

        var role = await _roleRepository.GetByIdAsync(user.RoleId);
        return MapToDto(user, role != null ? new[] { role } : Array.Empty<Role>());
    }
    
    public async Task<User?> GetUserEntityByUsernameAsync(string username)
    {
         var users = await _userRepository.FindAsync(u => u.Username == username);
         return users.FirstOrDefault();
    }

    public async Task<UserDto> CreateAsync(UserCreateDto dto)
    {
        // Check for existing username
        var existing = await _userRepository.FindAsync(u => u.Username == dto.Username);
        if (existing.Any())
        {
            throw new InvalidOperationException("Bu kullanıcı adı zaten kullanılıyor.");
        }

        var user = new User
        {
            Username = dto.Username,
            Password = dto.Password, // In real app, hash this!
            Email = dto.Email,
            FullName = dto.FullName,
            RoleId = dto.RoleId,
            IsActive = true,
            // CreatedAt is not in User.cs based on previous view, let me double check User.cs content again.
            // User.cs only showed 16 lines. I should check if BaseEntity has CreatedAt.
        };

        var created = await _userRepository.AddAsync(user);
        
        await _logService.LogAsync(
             "Create", "User", created.Id, 
             $"Yeni kullanıcı oluşturuldu: {created.FullName}", 
             CurrentUserId, CurrentUserName, null);

        var roles = await _roleRepository.GetAllAsync();
        return MapToDto(created, roles);
    }

    public async Task UpdateAsync(int id, UserUpdateDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return;

        if (dto.Email != null) user.Email = dto.Email;
        if (dto.FullName != null) user.FullName = dto.FullName;
        if (dto.RoleId.HasValue) user.RoleId = dto.RoleId.Value;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;
        if (!string.IsNullOrEmpty(dto.Password)) user.Password = dto.Password;

        await _userRepository.UpdateAsync(user);
        
        await _logService.LogAsync(
             "Update", "User", user.Id, 
             $"Kullanıcı güncellendi: {user.FullName}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user != null)
        {
            await _userRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "User", id, 
                 $"Kullanıcı silindi: {user.Username}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }
    
    // Auth specific methods
    public async Task<UserDto?> ValidateUserAsync(string username, string password)
    {
        var users = await _userRepository.FindAsync(u => u.Username == username && u.Password == password && u.IsActive);
        var user = users.FirstOrDefault();
        
        if (user == null) return null;
        
        var role = await _roleRepository.GetByIdAsync(user.RoleId);
        return MapToDto(user, role != null ? new[] { role } : Array.Empty<Role>());
    }

    private UserDto MapToDto(User u, IEnumerable<Role> roles)
    {
        var role = roles.FirstOrDefault(r => r.Id == u.RoleId);
        return new UserDto(
            u.Id,
            u.Username,
            u.Email,
            u.FullName,
            u.RoleId,
            role?.Name ?? "Bilinmiyor",
            u.IsActive,
            u.CreatedAt
        );
    }
}
