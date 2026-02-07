using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

// [Authorize]
[ApiController]
[Route("api/[controller]")]
public class BolumlerController : ControllerBase
{
    private readonly IBolumService _bolumService;

    public BolumlerController(IBolumService bolumService)
    {
        _bolumService = bolumService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BolumDto>>> GetAll()
    {
        var list = await _bolumService.GetAllAsync();
        return Ok(list);
    }

    [HttpGet("tree")]
    public async Task<ActionResult<IEnumerable<BolumDto>>> GetTree()
    {
        var tree = await _bolumService.GetTreeAsync();
        return Ok(tree);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BolumDto>> GetById(int id)
    {
        var dto = await _bolumService.GetByIdAsync(id);
        if (dto == null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<BolumDto>> Create(BolumCreateDto dto)
    {
        var result = await _bolumService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, BolumCreateDto dto)
    {
        await _bolumService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _bolumService.DeleteAsync(id);
        return NoContent();
    }
}
