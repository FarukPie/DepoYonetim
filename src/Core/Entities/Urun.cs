using DepoYonetim.Core.Enums;

namespace DepoYonetim.Core.Entities;

public class Urun : BaseEntity
{
    public string Ad { get; set; } = string.Empty;
    public string? Marka { get; set; }
    public string? Model { get; set; }
    public string? SeriNumarasi { get; set; }
    public string? Barkod { get; set; }
    public int KategoriId { get; set; }
    public int? DepoId { get; set; }
    public bool EkParcaVar { get; set; } = false;
    public Birim Birim { get; set; } = Birim.Adet;
    public decimal Maliyet { get; set; }
    public decimal KdvOrani { get; set; } = 18;
    public int GarantiSuresiAy { get; set; } = 12;
    public BakimTipi BozuldugundaBakimTipi { get; set; } = BakimTipi.Bakim;
    
    public int StokMiktari { get; set; } = 0;
    public UrunDurum Durum { get; set; } = UrunDurum.Aktif;

    // Navigation Properties
    public Kategori? Kategori { get; set; }
    public Depo? Depo { get; set; }
    public ICollection<Zimmet> Zimmetler { get; set; } = new List<Zimmet>();
    public ICollection<FaturaKalemi> FaturaKalemleri { get; set; } = new List<FaturaKalemi>();
}
