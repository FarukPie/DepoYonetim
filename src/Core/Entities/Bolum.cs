using DepoYonetim.Core.Enums;

namespace DepoYonetim.Core.Entities;

public class Bolum : BaseEntity
{
    public string Ad { get; set; } = string.Empty;
    public string Kod { get; set; } = string.Empty;
    public string? Aciklama { get; set; }
    public BolumTip Tip { get; set; }
    
    public int? UstBolumId { get; set; }

    // Navigation Properties
    public Bolum? UstBolum { get; set; }
    public ICollection<Bolum> AltBolumler { get; set; } = new List<Bolum>();
}
