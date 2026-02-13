namespace DepoYonetim.Application.DTOs;



// ===== MALZEME KALEMI DTOs =====
public record MalzemeKalemiDto(
    int Id,
    string Ad,
    string? DmbNo,
    bool EkParcaVar,
    string? ParcaAd,
    string Birim,
    string? Rutin,
    string? Aciklama,
    int State,
    int? KategoriId,
    string? KategoriAdi
);

public record MalzemeKalemiCreateDto(
    string Ad,
    string? DmbNo,
    bool EkParcaVar,
    string? ParcaAd,
    string Birim,
    string? Rutin,
    string? Aciklama,
    int State,
    int? KategoriId
);

// ===== KATEGORI DTOs =====
public record KategoriDto(
    int Id,
    string Ad,
    string? Aciklama,
    int? UstKategoriId,
    string? UstKategoriAdi,
    int AltKategoriSayisi,
    int UrunSayisi
);

public record KategoriCreateDto(
    string Ad,
    string? Aciklama,
    int? UstKategoriId
);

public record CategoryDto(
    int Id,
    string Name,
    int? ParentId,
    List<CategoryDto> SubCategories,
    int ProductCount
);

// ===== PERSONEL DTOs =====
public record PersonelDto(
    int Id,
    string Ad,
    string Soyad,
    string TamAd,
    string? TcNo,
    string? Departman,
    string? Unvan,
    string? Telefon,
    string? Email,
    DateTime? IseGirisTarihi,
    bool Aktif,
    int ZimmetSayisi
);

public record PersonelCreateDto(
    string Ad,
    string Soyad,
    string? TcNo,
    string? Departman,
    string? Unvan,
    string? Telefon,
    string? Email,
    DateTime? IseGirisTarihi
);

// ===== CARI DTOs =====
public record CariDto(
    int Id,
    string FirmaAdi,
    string Tip,
    string? TicaretSicilNo,
    string? VergiNo,
    string? VergiDairesi,
    string? Adres,
    string? Il,
    string? Ilce,
    string? Telefon,
    string? Email,
    string? YetkiliKisi,
    string? YetkiliTelefon,
    string? HastaneKod
);

public record CariCreateDto(
    string FirmaAdi,
    string Tip,
    string? TicaretSicilNo,
    string? VergiNo,
    string? VergiDairesi,
    string? Adres,
    string? Il,
    string? Ilce,
    string? Telefon,
    string? Email,
    string? YetkiliKisi,
    string? YetkiliTelefon,
    string? HastaneKod
);

// ===== FATURA DTOs =====
public record FaturaDto(
    int Id,
    string FaturaNo,
    int CariId,
    string CariAdi,
    DateTime FaturaTarihi,
    decimal AraToplam,
    decimal ToplamIndirim,
    decimal ToplamKdv,
    decimal GenelToplam,
    string? Aciklama,
    List<FaturaKalemiDto> Kalemler
);

public record FaturaCreateDto(
    string FaturaNo,
    int CariId,
    DateTime FaturaTarihi,
    string? Aciklama,
    List<FaturaKalemiCreateDto> Kalemler
);

public record FaturaKalemiDto(
    int Id,
    int? MalzemeKalemiId,
    string MalzemeAdi,
    decimal Miktar,
    decimal BirimFiyat,
    decimal IndirimOrani,
    decimal KdvOrani,
    decimal Toplam,
    bool ZimmetDurum,
    string? SeriNumarasi,
    string? Barkod
);

public record FaturaKalemiCreateDto(
    int? MalzemeKalemiId,
    string MalzemeAdi,
    decimal Miktar,
    decimal BirimFiyat,
    decimal IndirimOrani,
    decimal KdvOrani,
    bool ZimmetDurum,
    string? SeriNumarasi,
    string? Barkod
);

// ===== ZIMMET DTOs =====
public record ZimmetDto(
    int Id,
    int FaturaKalemiId,
    string MalzemeAdi,
    string? SeriNumarasi,
    string? Barkod,
    int? PersonelId,
    string? PersonelAdi,
    string? PersonelDepartman,
    int? BolumId,
    string? BolumAdi,
    DateTime ZimmetTarihi,
    DateTime? IadeTarihi,
    string Durum,
    string? Aciklama
);

public record ZimmetCreateDto(
    int FaturaKalemiId,
    int? PersonelId,
    int? BolumId,
    DateTime ZimmetTarihi,
    string? Aciklama
);

public record ZimmetUpdateDto(
    int FaturaKalemiId,
    int? PersonelId,
    int? BolumId,
    DateTime ZimmetTarihi,
    string Durum,
    string? Aciklama
);

// ===== DASHBOARD DTOs =====
public record DashboardDto(
    int ZimmetliCalisanSayisi,
    int ToplamStok,
    int ToplamKategori,
    int BakimdakiUrunSayisi,
    int TamirBekleyenSayisi,
    List<ZimmetDto> SonZimmetler,
    List<MalzemeKalemiDto> TamirBekleyenMalzemeler,
    List<TalepDto> OnaylananTalepler,
    List<MalzemeKalemiDto> BakimdakiMalzemeler
);

// ===== TALEP DTOs =====
public record TalepDto(
    int Id,
    string TalepTipi,
    int TalepEdenUserId,
    string? TalepEdenUserName,
    string Baslik,
    string? Detaylar,
    string? TalepData,
    string Durum,
    int? OnaylayanUserId,
    string? OnaylayanUserName,
    DateTime? OnayTarihi,
    string? RedNedeni,
    DateTime OlusturmaTarihi
);

public record CreateTalepDto(
    string TalepTipi,
    int TalepEdenUserId,
    string Baslik,
    string? Detaylar,
    string? TalepData
);

public record BolumDto(
    int Id,
    string Name,
    string Code,
    string Type,
    int? ParentId,
    List<BolumDto> SubLocations

);

public record BolumCreateDto(
    string Ad,
    string Kod,
    string Tip,
    int? UstBolumId

);
