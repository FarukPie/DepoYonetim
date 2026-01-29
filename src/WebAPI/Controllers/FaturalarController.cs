using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaturalarController : ControllerBase
{
    private readonly IFaturaService _faturaService;

    public FaturalarController(IFaturaService faturaService)
    {
        _faturaService = faturaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FaturaDto>>> GetAll(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] int? cariId)
    {
        if (cariId.HasValue)
        {
            var cariFaturalar = await _faturaService.GetByCariIdAsync(cariId.Value);
            return Ok(cariFaturalar);
        }
        
        if (startDate.HasValue && endDate.HasValue)
        {
            var dateRangeFaturalar = await _faturaService.GetByDateRangeAsync(startDate.Value, endDate.Value);
            return Ok(dateRangeFaturalar);
        }
        
        var faturalar = await _faturaService.GetAllAsync();
        return Ok(faturalar);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FaturaDto>> GetById(int id)
    {
        var fatura = await _faturaService.GetByIdAsync(id);
        if (fatura == null) return NotFound();
        return Ok(fatura);
    }

    [HttpPost]
    public async Task<ActionResult<FaturaDto>> Create([FromBody] FaturaCreateDto dto)
    {
        var fatura = await _faturaService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = fatura.Id }, fatura);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _faturaService.DeleteAsync(id);
        return NoContent();
    }
}
