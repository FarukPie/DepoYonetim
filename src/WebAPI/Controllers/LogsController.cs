using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private readonly ISystemLogService _logService;

    public LogsController(ISystemLogService logService)
    {
        _logService = logService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LogDto>>> GetAll(
        [FromQuery] string? action = null,
        [FromQuery] string? entityType = null,
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var logs = await _logService.GetAllAsync(action, entityType, userId, startDate, endDate);
        return Ok(logs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LogDto>> GetById(int id)
    {
        var log = await _logService.GetByIdAsync(id);
        if (log == null)
        {
            return NotFound(new { Message = "Log bulunamadı" });
        }
        return Ok(log);
    }

    [HttpGet("actions")]
    public ActionResult<IEnumerable<string>> GetActions()
    {
        var actions = new[] { "Login", "Logout", "Create", "Update", "Delete", "Approve", "Reject" };
        return Ok(actions);
    }

    [HttpGet("entity-types")]
    public ActionResult<IEnumerable<string>> GetEntityTypes()
    {
        var types = new[] { "User", "Role", "Cari", "Depo", "Kategori", "Urun", "Personel", "Fatura", "Zimmet", "Talep" };
        return Ok(types);
    }
}
