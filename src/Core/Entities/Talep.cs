namespace DepoYonetim.Core.Entities;

/// <summary>
/// Kullanıcı talep entity'si.
/// Kullanıcılar ekleme/silme/güncelleme işlemleri için talep oluşturur, admin onaylar.
/// </summary>
public class Talep : BaseEntity
{
    public string TalepTipi { get; set; } = string.Empty; // CariEkleme, DepoEkleme, KategoriEkleme, etc.
    public int TalepEdenUserId { get; set; }
    public string TalepEdenUserName { get; set; } = string.Empty;
    public string Baslik { get; set; } = string.Empty;
    public string Detaylar { get; set; } = string.Empty;
    
    /// <summary>
    /// Talep edilen veriler JSON formatında (örn: yeni cari bilgileri)
    /// </summary>
    public string TalepData { get; set; } = "{}";
    
    public string Durum { get; set; } = "Beklemede"; // Beklemede, Onaylandi, Reddedildi
    public int? OnaylayanUserId { get; set; }
    public string? OnaylayanUserName { get; set; }
    public DateTime? OnayTarihi { get; set; }
    public string? RedNedeni { get; set; }
    public DateTime OlusturmaTarihi { get; set; } = DateTime.Now;
}
