namespace DepoYonetim.Core.Entities;

public class FaturaKalemi : BaseEntity
{
    public int FaturaId { get; set; }
    public int? MalzemeKalemiId { get; set; }
    public string MalzemeAdi { get; set; } = string.Empty;
    public decimal Miktar { get; set; }
    public decimal BirimFiyat { get; set; }
    public decimal IndirimOrani { get; set; } = 0;
    public decimal KdvOrani { get; set; } = 18;
    public decimal Toplam { get; set; }
    public string? SeriNumarasi { get; set; }
    public string? Barkod { get; set; }
    public string? Marka { get; set; }
    public string? Model { get; set; }
    public bool ZimmetDurum { get; set; }

    // Navigation Properties
    public Fatura? Fatura { get; set; }
    public MalzemeKalemi? MalzemeKalemi { get; set; }
}
