using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UrunlerController : ControllerBase
{
    private readonly IUrunService _urunService;

    public UrunlerController(IUrunService urunService)
    {
        _urunService = urunService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UrunDto>>> GetAll([FromQuery] int? depoId, [FromQuery] string? search)
    {
        if (!string.IsNullOrEmpty(search))
        {
            var searchResult = await _urunService.SearchAsync(search);
            return Ok(searchResult);
        }
        
        if (depoId.HasValue)
        {
            var depoUrunler = await _urunService.GetByDepoIdAsync(depoId.Value);
            return Ok(depoUrunler);
        }
        
        var urunler = await _urunService.GetAllAsync();
        return Ok(urunler);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UrunDto>> GetById(int id)
    {
        var urun = await _urunService.GetByIdAsync(id);
        if (urun == null) return NotFound();
        return Ok(urun);
    }

    [HttpPost]
    public async Task<ActionResult<UrunDto>> Create([FromBody] UrunCreateDto dto)
    {
        var urun = await _urunService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = urun.Id }, urun);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UrunCreateDto dto)
    {
        await _urunService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _urunService.DeleteAsync(id);
        return NoContent();
    }
}
