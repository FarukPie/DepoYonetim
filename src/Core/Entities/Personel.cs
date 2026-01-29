namespace DepoYonetim.Core.Entities;

public class Personel : BaseEntity
{
    public string Ad { get; set; } = string.Empty;
    public string Soyad { get; set; } = string.Empty;
    public string? TcNo { get; set; }
    public string? Departman { get; set; }
    public string? Unvan { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public DateTime? IseGirisTarihi { get; set; }
    public bool Aktif { get; set; } = true;

    // Navigation Properties
    public ICollection<Depo> SorumluDepoları { get; set; } = new List<Depo>();
    public ICollection<Zimmet> Zimmetler { get; set; } = new List<Zimmet>();

    public string TamAd => $"{Ad} {Soyad}";
}
