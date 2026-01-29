namespace DepoYonetim.Core.Entities;

public class Depo : BaseEntity
{
    public string Ad { get; set; } = string.Empty;
    public string? Aciklama { get; set; }
    public int? SorumluPersonelId { get; set; }
    public bool Aktif { get; set; } = true;

    // Navigation Properties
    public Personel? SorumluPersonel { get; set; }
    public ICollection<Urun> Urunler { get; set; } = new List<Urun>();
}
