namespace DepoYonetim.Application.DTOs;

public record RoleDto(
    int Id,
    string Name,
    string Description,
    string[] PagePermissions,
    Dictionary<string, string[]> EntityPermissions
);

public record CreateRoleDto(
    string Name,
    string Description,
    string[] PagePermissions,
    Dictionary<string, string[]> EntityPermissions
);

public record UpdateRoleDto(
    string? Name,
    string? Description,
    string[]? PagePermissions,
    Dictionary<string, string[]>? EntityPermissions
);
