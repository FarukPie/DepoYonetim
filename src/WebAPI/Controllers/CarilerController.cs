using System;
using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarilerController : ControllerBase
{
    private readonly ICariService _cariService;

    public CarilerController(ICariService cariService)
    {
        _cariService = cariService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CariDto>>> GetAll([FromQuery] string? search)
    {
        if (!string.IsNullOrEmpty(search))
        {
            var searchResult = await _cariService.SearchAsync(search);
            return Ok(searchResult);
        }
        
        var cariler = await _cariService.GetAllAsync();
        return Ok(cariler);
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResultDto<CariDto>>> GetPaged([FromQuery] PaginationRequest request)
    {
        var result = await _cariService.GetPagedAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CariDto>> GetById(int id)
    {
        var cari = await _cariService.GetByIdAsync(id);
        if (cari == null) return NotFound();
        return Ok(cari);
    }

    [HttpPost]
    public async Task<ActionResult<CariDto>> Create([FromBody] CariCreateDto dto)
    {
        try
        {
            var cari = await _cariService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = cari.Id }, cari);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Cari kaydedilirken hata oluştu: " + ex.Message, details = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CariCreateDto dto)
    {
        await _cariService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _cariService.DeleteAsync(id);
        return NoContent();
    }
}
