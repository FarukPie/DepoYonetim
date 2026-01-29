using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonellerController : ControllerBase
{
    private readonly IPersonelService _personelService;

    public PersonellerController(IPersonelService personelService)
    {
        _personelService = personelService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonelDto>>> GetAll([FromQuery] string? search)
    {
        if (!string.IsNullOrEmpty(search))
        {
            var searchResult = await _personelService.SearchAsync(search);
            return Ok(searchResult);
        }
        
        var personeller = await _personelService.GetAllAsync();
        return Ok(personeller);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PersonelDto>> GetById(int id)
    {
        var personel = await _personelService.GetByIdAsync(id);
        if (personel == null) return NotFound();
        return Ok(personel);
    }

    [HttpPost]
    public async Task<ActionResult<PersonelDto>> Create([FromBody] PersonelCreateDto dto)
    {
        var personel = await _personelService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = personel.Id }, personel);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PersonelCreateDto dto)
    {
        await _personelService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _personelService.DeleteAsync(id);
        return NoContent();
    }
}
