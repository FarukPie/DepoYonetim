using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace DepoYonetim.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new { Message = "Kullanıcı bulunamadı" });
        }
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] UserCreateDto request)
    {
        try 
        {
            var user = await _userService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] UserUpdateDto request)
    {
        var existing = await _userService.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound(new { Message = "Kullanıcı bulunamadı" });
        }

        await _userService.UpdateAsync(id, request);
        return Ok(new { Message = "Kullanıcı güncellendi" }); // Returning object or 204 No Content
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var existing = await _userService.GetByIdAsync(id);
        if (existing == null)
        {
            return NotFound(new { Message = "Kullanıcı bulunamadı" });
        }

        await _userService.DeleteAsync(id);
        return NoContent();
    }
}
