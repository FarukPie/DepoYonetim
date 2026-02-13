using DepoYonetim.Core.Enums;

namespace DepoYonetim.Core.Entities;

public class Zimmet : BaseEntity
{
    public int FaturaKalemiId { get; set; }
    public int? PersonelId { get; set; }
    public int? BolumId { get; set; }
    public DateTime ZimmetTarihi { get; set; }
    public DateTime? IadeTarihi { get; set; }
    public ZimmetDurum Durum { get; set; } = ZimmetDurum.Aktif;
    public string? Aciklama { get; set; }

    // Navigation Properties
    public FaturaKalemi? FaturaKalemi { get; set; }
    public Personel? Personel { get; set; }
    public Bolum? Bolum { get; set; }
}
