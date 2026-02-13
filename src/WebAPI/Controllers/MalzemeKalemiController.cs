using System;
using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/malzemekalemleri")]
public class MalzemeKalemiController : ControllerBase
{
    private readonly IMalzemeKalemiService _malzemeService;

    public MalzemeKalemiController(IMalzemeKalemiService malzemeService)
    {
        _malzemeService = malzemeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MalzemeKalemiDto>>> GetAll([FromQuery] string? search)
    {
        if (!string.IsNullOrEmpty(search))
        {
            var searchResult = await _malzemeService.SearchAsync(search);
            return Ok(searchResult);
        }
        
        var malzemeler = await _malzemeService.GetAllAsync();
        return Ok(malzemeler);
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResultDto<MalzemeKalemiDto>>> GetPaged([FromQuery] PaginationRequest request)
    {
        var result = await _malzemeService.GetPagedAsync(request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MalzemeKalemiDto>> GetById(int id)
    {
        var malzeme = await _malzemeService.GetByIdAsync(id);
        if (malzeme == null) return NotFound();
        return Ok(malzeme);
    }

    [HttpPost]
    public async Task<ActionResult<MalzemeKalemiDto>> Create([FromBody] MalzemeKalemiCreateDto dto)
    {
        try 
        {
            var malzeme = await _malzemeService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = malzeme.Id }, malzeme);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Hata oluştu: " + ex.Message, details = ex.InnerException?.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] MalzemeKalemiCreateDto dto)
    {
        await _malzemeService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _malzemeService.DeleteAsync(id);
        return NoContent();
    }
}
