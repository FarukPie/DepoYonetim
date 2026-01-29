namespace DepoYonetim.Core.Entities;

/// <summary>
/// Sistem aktivite log entity'si.
/// Tüm önemli işlemler burada loglanır.
/// </summary>
public class SystemLog : BaseEntity
{
    public int? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Login, Logout, Create, Update, Delete, Approve, Reject
    public string EntityType { get; set; } = string.Empty; // User, Cari, Depo, Kategori, Talep, etc.
    public int? EntityId { get; set; }
    public string Details { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.Now;
    public string? IpAddress { get; set; }
}
