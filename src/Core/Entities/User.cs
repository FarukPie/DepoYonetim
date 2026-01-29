namespace DepoYonetim.Core.Entities;

/// <summary>
/// Sistem kullanıcısı entity'si.
/// </summary>
public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public bool IsActive { get; set; } = true;

}
