using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KategorilerController : ControllerBase
{
    private readonly IKategoriService _kategoriService;

    public KategorilerController(IKategoriService kategoriService)
    {
        _kategoriService = kategoriService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<KategoriDto>>> GetAll([FromQuery] bool? anaKategoriler, [FromQuery] int? ustKategoriId)
    {
        if (anaKategoriler == true)
        {
            var ana = await _kategoriService.GetAnaKategorilerAsync();
            return Ok(ana);
        }
        
        if (ustKategoriId.HasValue)
        {
            var alt = await _kategoriService.GetAltKategorilerAsync(ustKategoriId.Value);
            return Ok(alt);
        }
        
        var kategoriler = await _kategoriService.GetAllAsync();
        return Ok(kategoriler);
    }

    [HttpGet("tree")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetTree()
    {
        var tree = await _kategoriService.GetCategoryTreeAsync();
        return Ok(tree);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<KategoriDto>> GetById(int id)
    {
        var kategori = await _kategoriService.GetByIdAsync(id);
        if (kategori == null) return NotFound();
        return Ok(kategori);
    }

    [HttpPost]
    public async Task<ActionResult<KategoriDto>> Create([FromBody] KategoriCreateDto dto)
    {
        var kategori = await _kategoriService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = kategori.Id }, kategori);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] KategoriCreateDto dto)
    {
        await _kategoriService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _kategoriService.DeleteAsync(id);
        return NoContent();
    }
}
