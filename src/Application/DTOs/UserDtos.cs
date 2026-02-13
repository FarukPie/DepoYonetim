namespace DepoYonetim.Application.DTOs;

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

public record UserCreateDto(
    string Username,
    string Password,
    string Email,
    string FullName,
    int RoleId
);

public record UserUpdateDto(
    string? Email,
    string? FullName,
    int? RoleId,
    bool? IsActive,
    string? Password
);
