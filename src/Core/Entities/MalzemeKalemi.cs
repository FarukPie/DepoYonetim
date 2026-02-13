using DepoYonetim.Core.Enums;

namespace DepoYonetim.Core.Entities;

public class MalzemeKalemi : BaseEntity
{
    public string Ad { get; set; } = string.Empty;
    public string? DmbNo { get; set; } // LongText
    public bool EkParcaVar { get; set; } = false;
    public string? ParcaAd { get; set; } // LongText - Ek parça adı
    public string Birim { get; set; } = string.Empty;
    public string? Rutin { get; set; } // LongText
    public string? Aciklama { get; set; } // LongText
    public int State { get; set; } // Int

    // Navigation Properties
    public int? KategoriId { get; set; }
    public Kategori? Kategori { get; set; }

    public ICollection<Zimmet> Zimmetler { get; set; } = new List<Zimmet>();
    public ICollection<FaturaKalemi> FaturaKalemleri { get; set; } = new List<FaturaKalemi>();
}
