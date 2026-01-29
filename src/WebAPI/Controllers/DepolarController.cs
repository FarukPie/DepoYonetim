using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepolarController : ControllerBase
{
    private readonly IDepoService _depoService;

    public DepolarController(IDepoService depoService)
    {
        _depoService = depoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DepoDto>>> GetAll()
    {
        var depolar = await _depoService.GetAllAsync();
        return Ok(depolar);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DepoDto>> GetById(int id)
    {
        var depo = await _depoService.GetByIdAsync(id);
        if (depo == null) return NotFound();
        return Ok(depo);
    }

    [HttpPost]
    public async Task<ActionResult<DepoDto>> Create([FromBody] DepoCreateDto dto)
    {
        var depo = await _depoService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = depo.Id }, depo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] DepoUpdateDto dto)
    {
        await _depoService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _depoService.DeleteAsync(id);
        return NoContent();
    }
}
