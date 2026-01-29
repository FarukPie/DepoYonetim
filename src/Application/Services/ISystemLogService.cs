using DepoYonetim.Application.DTOs;

namespace DepoYonetim.Application.Services;

public interface ISystemLogService
{
    Task<IEnumerable<LogDto>> GetAllAsync(
        string? action = null,
        string? entityType = null,
        int? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null);

    Task<LogDto?> GetByIdAsync(int id);
    Task LogAsync(string action, string entityType, int? entityId, string details, int? userId, string userName, string? ipAddress);
}
