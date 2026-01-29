using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ZimmetlerController : ControllerBase
{
    private readonly IZimmetService _zimmetService;

    public ZimmetlerController(IZimmetService zimmetService)
    {
        _zimmetService = zimmetService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ZimmetDto>>> GetAll([FromQuery] int? count)
    {
        if (count.HasValue)
        {
            var sonZimmetler = await _zimmetService.GetSonZimmetlerAsync(count.Value);
            return Ok(sonZimmetler);
        }
        
        var zimmetler = await _zimmetService.GetAllAsync();
        return Ok(zimmetler);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ZimmetDto>> GetById(int id)
    {
        var zimmet = await _zimmetService.GetByIdAsync(id);
        if (zimmet == null) return NotFound();
        return Ok(zimmet);
    }

    [HttpPost]
    public async Task<ActionResult<ZimmetDto>> Create([FromBody] ZimmetCreateDto dto)
    {
        var zimmet = await _zimmetService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = zimmet.Id }, zimmet);
    }

    [HttpPut("{id}/iade")]
    public async Task<IActionResult> IadeEt(int id)
    {
        await _zimmetService.IadeEtAsync(id);
        return NoContent();
    }
}
