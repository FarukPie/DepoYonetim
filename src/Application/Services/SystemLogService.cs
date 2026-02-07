using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class SystemLogService : ISystemLogService
{
    private readonly IRepository<SystemLog> _logRepository;

    public SystemLogService(IRepository<SystemLog> logRepository)
    {
        _logRepository = logRepository;
    }

    private LogDto MapToDto(SystemLog log)
    {
        return new LogDto(
            log.Id,
            log.UserId,
            log.UserName,
            log.Action,
            log.EntityType,
            log.EntityId,
            log.Details,
            log.Timestamp,
            log.IpAddress
        );
    }

    public async Task<IEnumerable<LogDto>> GetAllAsync(
        string? action = null,
        string? entityType = null,
        int? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        // Note: For large datasets, it's better to use IQueryable in Repository or Specification pattern.
        // For now, assuming standard Repository.GetAllAsync() returns specific results or we filter in memory (not ideal for logs but acceptable for start).
        // A better approach with generic repository is using FindAsync or Specification.
        // Since I can't easily change Repository interface right now, I'll fetch all or use FindAsync with predicate if supported fully.
        // Assuming FindAsync takes a predicate.
        
        var logs = await _logRepository.GetAllAsync();
        
        // In-memory filtering (WARNING: Performance hit if logs table is huge. Should improve later with proper IQueryable support)
        if (!string.IsNullOrEmpty(action))
             logs = logs.Where(l => l.Action == action);
        
        if (!string.IsNullOrEmpty(entityType))
             logs = logs.Where(l => l.EntityType == entityType);
        
        if (userId.HasValue)
             logs = logs.Where(l => l.UserId == userId);
        
        if (startDate.HasValue)
             logs = logs.Where(l => l.Timestamp >= startDate.Value);
        
        if (endDate.HasValue)
             logs = logs.Where(l => l.Timestamp <= endDate.Value);

        return logs
            .OrderByDescending(l => l.Timestamp)
            .Select(MapToDto);
    }

    public async Task<LogDto?> GetByIdAsync(int id)
    {
        var log = await _logRepository.GetByIdAsync(id);
        return log == null ? null : MapToDto(log);
    }

    public async Task LogAsync(string action, string entityType, int? entityId, string details, int? userId, string userName, string? ipAddress)
    {
        try 
        {
            var log = new SystemLog
            {
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                UserId = userId,
                UserName = userName,
                IpAddress = ipAddress,
                Timestamp = DateTime.Now
            };

            await _logRepository.AddAsync(log);
        }
        catch (Exception ex)
        {
            // Logging failed, but we shouldn't fail the operation
            Console.WriteLine($"LOGGING ERROR: {ex.Message}");
        }
    }
}
