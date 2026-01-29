namespace DepoYonetim.Application.DTOs;

public record LogDto(
    int Id,
    int? UserId,
    string UserName,
    string Action,
    string EntityType,
    int? EntityId,
    string Details,
    DateTime Timestamp,
    string? IpAddress
);
