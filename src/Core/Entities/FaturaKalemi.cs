namespace DepoYonetim.Core.Entities;

public class FaturaKalemi : BaseEntity
{
    public int FaturaId { get; set; }
    public int? UrunId { get; set; }
    public string UrunAdi { get; set; } = string.Empty;
    public decimal Miktar { get; set; }
    public decimal BirimFiyat { get; set; }
    public decimal IndirimOrani { get; set; } = 0;
    public decimal KdvOrani { get; set; } = 18;
    public decimal Toplam { get; set; }

    // Navigation Properties
    public Fatura? Fatura { get; set; }
    public Urun? Urun { get; set; }
}
