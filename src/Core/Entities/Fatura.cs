namespace DepoYonetim.Core.Entities;

public class Fatura : BaseEntity
{
    public string FaturaNo { get; set; } = string.Empty;
    public int CariId { get; set; }
    public DateTime FaturaTarihi { get; set; }

    public string? Aciklama { get; set; }

    // Navigation Properties
    public Cari? Cari { get; set; }
    public ICollection<FaturaKalemi> Kalemler { get; set; } = new List<FaturaKalemi>();
}
