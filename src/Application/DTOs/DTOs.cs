namespace DepoYonetim.Application.DTOs;

// ===== DEPO DTOs =====
public record DepoDto(
    int Id,
    string Ad,
    string? Aciklama,
    int? SorumluPersonelId,
    string? SorumluPersonelAdi,
    bool Aktif,
    int UrunSayisi
);

public record DepoCreateDto(
    string Ad,
    string? Aciklama,
    int? SorumluPersonelId,
    bool Aktif
);

public record DepoUpdateDto(
    string Ad,
    string? Aciklama,
    int? SorumluPersonelId,
    bool Aktif
);

// ===== URUN DTOs =====
public record UrunDto(
    int Id,
    string Ad,
    string? Marka,
    string? Model,
    string? SeriNumarasi,
    string? Barkod,
    int KategoriId,
    string? KategoriAdi,
    int? DepoId,
    string? DepoAdi,
    bool EkParcaVar,
    string Birim,
    decimal Maliyet,
    decimal KdvOrani,
    int GarantiSuresiAy,
    string BozuldugundaBakimTipi,
    int StokMiktari,
    string Durum
);

public record UrunCreateDto(
    string Ad,
    string? Marka,
    string? Model,
    string? SeriNumarasi,
    string? Barkod,
    int KategoriId,
    int? DepoId,
    bool EkParcaVar,
    string Birim,
    decimal Maliyet,
    decimal KdvOrani,
    int GarantiSuresiAy,
    string BozuldugundaBakimTipi,
    int StokMiktari,
    string? Durum
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
    string? Fax,
    string? Email,
    string? WebSitesi,
    string? YetkiliKisi,
    string? YetkiliTelefon,
    string? BankaAdi,
    string? IbanNo,
    bool Aktif
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
    string? Fax,
    string? Email,
    string? WebSitesi,
    string? YetkiliKisi,
    string? YetkiliTelefon,
    string? BankaAdi,
    string? IbanNo
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
    int? UrunId,
    string UrunAdi,
    decimal Miktar,
    decimal BirimFiyat,
    decimal IndirimOrani,
    decimal KdvOrani,
    decimal Toplam
);

public record FaturaKalemiCreateDto(
    int? UrunId,
    string UrunAdi,
    decimal Miktar,
    decimal BirimFiyat,
    decimal IndirimOrani,
    decimal KdvOrani
);

// ===== ZIMMET DTOs =====
public record ZimmetDto(
    int Id,
    int UrunId,
    string UrunAdi,
    int? PersonelId,
    string? PersonelAdi,
    int? BolumId,
    string? BolumAdi,
    DateTime ZimmetTarihi,
    DateTime? IadeTarihi,
    string Durum,
    string? Aciklama
);

public record ZimmetCreateDto(
    int UrunId,
    int? PersonelId,
    int? BolumId,
    DateTime ZimmetTarihi,
    string? Aciklama
);

public record ZimmetUpdateDto(
    int UrunId,
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
    List<UrunDto> TamirBekleyenUrunler,
    List<TalepDto> OnaylananTalepler,
    List<UrunDto> BakimdakiUrunler
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
    List<BolumDto> SubLocations,
    string? Description
);

public record BolumCreateDto(
    string Ad,
    string Kod,
    string Tip,
    int? UstBolumId,
    string? Aciklama
);
