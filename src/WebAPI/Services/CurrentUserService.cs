using DepoYonetim.Core.Interfaces;
using System.Security.Claims;

namespace DepoYonetim.WebAPI.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int? UserId 
    {
        get 
        {
            var idClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("Id")?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }
    }

    public string UserName => _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System";
}
