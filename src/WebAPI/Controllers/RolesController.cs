using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
    {
        var roles = await _roleService.GetAllAsync();
        return Ok(roles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoleDto>> GetById(int id)
    {
        var role = await _roleService.GetByIdAsync(id);
        if (role == null)
        {
            return NotFound(new { Message = "Rol bulunamadı" });
        }
        return Ok(role);
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> Create([FromBody] CreateRoleDto request)
    {
        try
        {
            var created = await _roleService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RoleDto>> Update(int id, [FromBody] UpdateRoleDto request)
    {
        try
        {
            var updated = await _roleService.UpdateAsync(id, request);
            return Ok(updated);
        }
        catch (Exception ex)
        {
             // Simple exception handling. In prod, middleware is better.
             if (ex.Message == "Rol bulunamadı") return NotFound(new { Message = ex.Message });
             return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            await _roleService.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("available-pages")]
    public ActionResult<IEnumerable<object>> GetAvailablePages()
    {
        var pages = new[]
        {
            new { key = "dashboard", label = "Dashboard" },
            new { key = "depolar", label = "Depolar" },
            new { key = "urunler", label = "Ürünler" },
            new { key = "faturalar", label = "Faturalar" },
            new { key = "cariler", label = "Cariler" },
            new { key = "kategoriler", label = "Kategoriler" },
            new { key = "personeller", label = "Personeller" },
            new { key = "zimmetler", label = "Zimmetler" },
            new { key = "kullanicilar", label = "Kullanıcılar" },
            new { key = "roller", label = "Rol Yönetimi" },
            new { key = "talepler", label = "Talepler" },
            new { key = "loglar", label = "Loglar" },
            new { key = "talep-olustur", label = "Talep Oluştur" },
        };
        return Ok(pages);
    }

    [HttpGet("available-permissions")]
    public ActionResult<IEnumerable<object>> GetAvailablePermissions()
    {
        var permissions = new[]
        {
            new { entity = "cari", label = "Cariler", actions = new[] { "add", "edit", "delete" } },
            new { entity = "depo", label = "Depolar", actions = new[] { "add", "edit", "delete" } },
            new { entity = "kategori", label = "Kategoriler", actions = new[] { "add", "edit", "delete" } },
            new { entity = "kullanici", label = "Kullanıcılar", actions = new[] { "add", "edit", "delete" } },
        };
        return Ok(permissions);
    }
}
