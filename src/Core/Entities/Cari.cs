using DepoYonetim.Core.Enums;

namespace DepoYonetim.Core.Entities;

public class Cari : BaseEntity
{
    public string FirmaAdi { get; set; } = string.Empty;
    public CariTipi Tip { get; set; } = CariTipi.Tedarikci;
    public string? TicaretSicilNo { get; set; }
    public string? VergiNo { get; set; }
    public string? VergiDairesi { get; set; }
    public string? Adres { get; set; }
    public string? Il { get; set; }
    public string? Ilce { get; set; }
    public string? Telefon { get; set; }
    public string? Fax { get; set; }
    public string? Email { get; set; }
    public string? WebSitesi { get; set; }
    public string? YetkiliKisi { get; set; }
    public string? YetkiliTelefon { get; set; }
    public string? BankaAdi { get; set; }
    public string? IbanNo { get; set; }
    public bool Aktif { get; set; } = true;

    // Navigation Properties
    public ICollection<Fatura> Faturalar { get; set; } = new List<Fatura>();
}
