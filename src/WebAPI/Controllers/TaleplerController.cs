using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaleplerController : ControllerBase
{
    private readonly ITalepService _talepService;

    public TaleplerController(ITalepService talepService)
    {
        _talepService = talepService;
    }

    public record OnaylaRequest(int OnaylayanUserId);
    public record ReddetRequest(int OnaylayanUserId, string RedNedeni);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TalepDto>>> GetAll([FromQuery] string? durum = null)
    {
        var talepler = await _talepService.GetAllAsync(durum);
        return Ok(talepler);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TalepDto>> GetById(int id)
    {
        var talep = await _talepService.GetByIdAsync(id);
        if (talep == null) return NotFound(new { Message = "Talep bulunamadı" });
        return Ok(talep);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TalepDto>>> GetByUser(int userId)
    {
        var talepler = await _talepService.GetByUserIdAsync(userId);
        return Ok(talepler);
    }

    [HttpPost]
    public async Task<ActionResult<TalepDto>> Create([FromBody] CreateTalepDto request)
    {
        try 
        {
            var talep = await _talepService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = talep.Id }, talep);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}/onayla")]
    public async Task<ActionResult<TalepDto>> Onayla(int id, [FromBody] OnaylaRequest request)
    {
        try
        {
            var talep = await _talepService.OnaylaAsync(id, request.OnaylayanUserId);
            return Ok(talep);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Onayla Hatası: {ex}");
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}/reddet")]
    public async Task<ActionResult<TalepDto>> Reddet(int id, [FromBody] ReddetRequest request)
    {
        try
        {
            var talep = await _talepService.ReddetAsync(id, request.OnaylayanUserId, request.RedNedeni);
            return Ok(talep);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Reddet Hatası: {ex}");
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("bekleyen-sayisi")]
    public async Task<ActionResult<int>> GetBekleyenSayisi()
    {
        var count = await _talepService.GetBekleyenSayisiAsync();
        return Ok(count);
    }
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _talepService.DeleteAsync(id);
        return NoContent();
    }
}
