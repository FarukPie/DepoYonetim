using System.Text.Json;
using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class RoleService : IRoleService
{
    private readonly IRepository<Role> _roleRepository;
    private readonly IRepository<User> _userRepository;
    private readonly ISystemLogService _logService; // For logging actions

    public RoleService(IRepository<Role> roleRepository, IRepository<User> userRepository, ISystemLogService logService)
    {
        _roleRepository = roleRepository;
        _userRepository = userRepository;
        _logService = logService;
    }

    private RoleDto MapToDto(Role role)
    {
        var pagePerms = string.IsNullOrEmpty(role.PagePermissions) 
            ? Array.Empty<string>() 
            : JsonSerializer.Deserialize<string[]>(role.PagePermissions) ?? Array.Empty<string>();
        
        var entityPerms = string.IsNullOrEmpty(role.EntityPermissions)
            ? new Dictionary<string, string[]>()
            : JsonSerializer.Deserialize<Dictionary<string, string[]>>(role.EntityPermissions) ?? new Dictionary<string, string[]>();

        return new RoleDto(role.Id, role.Name, role.Description, pagePerms, entityPerms);
    }

    public async Task<IEnumerable<RoleDto>> GetAllAsync()
    {
        var roles = await _roleRepository.GetAllAsync();
        return roles.Select(MapToDto);
    }

    public async Task<RoleDto?> GetByIdAsync(int id)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        return role == null ? null : MapToDto(role);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
    {
        // Simple duplicate check (in-memory loaded, might need better approach for optimization but ok for Roles)
        var allRoles = await _roleRepository.GetAllAsync();
        if (allRoles.Any(r => r.Name == dto.Name))
        {
            throw new Exception("Bu isimde bir rol zaten var");
        }

        var newRole = new Role
        {
            Name = dto.Name,
            Description = dto.Description,
            PagePermissions = JsonSerializer.Serialize(dto.PagePermissions),
            EntityPermissions = JsonSerializer.Serialize(dto.EntityPermissions)
        };

        var created = await _roleRepository.AddAsync(newRole);
        
        await _logService.LogAsync("Create", "Role", created.Id, $"Yeni rol oluşturuldu: {created.Name}", null, "System", null); // User info should ideally come from Context but simplifying for now

        return MapToDto(created);
    }

    public async Task<RoleDto> UpdateAsync(int id, UpdateRoleDto dto)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        if (role == null) throw new Exception("Rol bulunamadı");

        if (dto.Name != null) role.Name = dto.Name;
        if (dto.Description != null) role.Description = dto.Description;
        if (dto.PagePermissions != null) role.PagePermissions = JsonSerializer.Serialize(dto.PagePermissions);
        if (dto.EntityPermissions != null) role.EntityPermissions = JsonSerializer.Serialize(dto.EntityPermissions);

        await _roleRepository.UpdateAsync(role);
        
        await _logService.LogAsync("Update", "Role", role.Id, $"Rol güncellendi: {role.Name}", null, "System", null);

        return MapToDto(role);
    }

    public async Task DeleteAsync(int id)
    {
        var role = await _roleRepository.GetByIdAsync(id);
        if (role == null) throw new Exception("Rol bulunamadı");

        var users = await _userRepository.FindAsync(u => u.RoleId == id);
        if (users.Any())
        {
            throw new Exception("Bu role atanmış kullanıcılar var. Önce kullanıcıların rolünü değiştirin.");
        }

        await _roleRepository.DeleteAsync(id);
        
        await _logService.LogAsync("Delete", "Role", id, $"Rol silindi: {role.Name}", null, "System", null);
    }
}
