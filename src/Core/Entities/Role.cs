namespace DepoYonetim.Core.Entities;

/// <summary>
/// Kullanıcı rolü entity'si.
/// Sayfa erişim yetkileri ve CRUD yetkileri JSON formatında tutulur.
/// </summary>
public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// Erişilebilir sayfa listesi (JSON array: ["dashboard", "depolar", "urunler", ...])
    /// </summary>
    public string PagePermissions { get; set; } = "[]";
    
    /// <summary>
    /// Entity bazlı CRUD yetkileri (JSON object: {"cari": ["add", "edit", "delete"], "depo": ["add"], ...})
    /// </summary>
    public string EntityPermissions { get; set; } = "{}";
}
