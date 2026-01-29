namespace DepoYonetim.Core.Entities;

public class Kategori : BaseEntity
{
    public string Ad { get; set; } = string.Empty;
    public string? Aciklama { get; set; }
    public int? UstKategoriId { get; set; }

    // Navigation Properties
    public Kategori? UstKategori { get; set; }
    public ICollection<Kategori> AltKategoriler { get; set; } = new List<Kategori>();
    public ICollection<Urun> Urunler { get; set; } = new List<Urun>();
}
