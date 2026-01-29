using DepoYonetim.Application.DTOs;

namespace DepoYonetim.Application.Services;

public interface IRoleService
{
    Task<IEnumerable<RoleDto>> GetAllAsync();
    Task<RoleDto?> GetByIdAsync(int id);
    Task<RoleDto> CreateAsync(CreateRoleDto request);
    Task<RoleDto> UpdateAsync(int id, UpdateRoleDto request);
    Task DeleteAsync(int id);
}
