using DepoYonetim.Application.DTOs;
using DepoYonetim.Application.Services;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Infrastructure.Data;

namespace DepoYonetim.Infrastructure.Services;

public class MockDepoService : IDepoService
{
    public Task<IEnumerable<DepoDto>> GetAllAsync()
    {
        var result = MockData.Depolar.Select(d => new DepoDto(
            d.Id,
            d.Ad,
            d.Aciklama,
            d.SorumluPersonelId,
            MockData.Personeller.FirstOrDefault(p => p.Id == d.SorumluPersonelId)?.TamAd,
            d.Aktif,
            MockData.Urunler.Count(u => u.DepoId == d.Id)
        ));
        return Task.FromResult(result);
    }

    public Task<DepoDto?> GetByIdAsync(int id)
    {
        var d = MockData.Depolar.FirstOrDefault(x => x.Id == id);
        if (d == null) return Task.FromResult<DepoDto?>(null);
        
        return Task.FromResult<DepoDto?>(new DepoDto(
            d.Id, d.Ad, d.Aciklama, d.SorumluPersonelId,
            MockData.Personeller.FirstOrDefault(p => p.Id == d.SorumluPersonelId)?.TamAd,
            d.Aktif, MockData.Urunler.Count(u => u.DepoId == d.Id)
        ));
    }

    public Task<DepoDto> CreateAsync(DepoCreateDto dto)
    {
        var newId = MockData.Depolar.Max(d => d.Id) + 1;
        var entity = new Depo { Id = newId, Ad = dto.Ad, Aciklama = dto.Aciklama, SorumluPersonelId = dto.SorumluPersonelId, Aktif = dto.Aktif };
        MockData.Depolar.Add(entity);
        return Task.FromResult(new DepoDto(newId, dto.Ad, dto.Aciklama, dto.SorumluPersonelId, null, dto.Aktif, 0));
    }

    public Task UpdateAsync(int id, DepoUpdateDto dto)
    {
        var entity = MockData.Depolar.FirstOrDefault(d => d.Id == id);
        if (entity != null)
        {
            entity.Ad = dto.Ad;
            entity.Aciklama = dto.Aciklama;
            entity.SorumluPersonelId = dto.SorumluPersonelId;
            entity.Aktif = dto.Aktif;
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        var entity = MockData.Depolar.FirstOrDefault(d => d.Id == id);
        if (entity != null) MockData.Depolar.Remove(entity);
        return Task.CompletedTask;
    }
}

public class MockUrunService : IUrunService
{
    public Task<IEnumerable<UrunDto>> GetAllAsync()
    {
        return Task.FromResult(MockData.Urunler.Select(MapToDto));
    }

    public Task<IEnumerable<UrunDto>> GetByDepoIdAsync(int depoId)
    {
        return Task.FromResult(MockData.Urunler.Where(u => u.DepoId == depoId).Select(MapToDto));
    }

    public Task<IEnumerable<UrunDto>> SearchAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return Task.FromResult(MockData.Urunler.Where(u => u.Ad.ToLower().Contains(term)).Select(MapToDto));
    }

    public Task<UrunDto?> GetByIdAsync(int id)
    {
        var u = MockData.Urunler.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(u != null ? MapToDto(u) : null);
    }

    public Task<UrunDto> CreateAsync(UrunCreateDto dto)
    {
        var newId = MockData.Urunler.Max(u => u.Id) + 1;
        var entity = new Urun
        {
            Id = newId, Ad = dto.Ad, Marka = dto.Marka, Model = dto.Model, SeriNumarasi = dto.SeriNumarasi, Barkod = dto.Barkod,
            KategoriId = dto.KategoriId, DepoId = dto.DepoId,
            EkParcaVar = dto.EkParcaVar, Birim = Enum.Parse<Birim>(dto.Birim),
            Maliyet = dto.Maliyet, KdvOrani = dto.KdvOrani, GarantiSuresiAy = dto.GarantiSuresiAy,
            BozuldugundaBakimTipi = Enum.Parse<BakimTipi>(dto.BozuldugundaBakimTipi),
            StokMiktari = dto.StokMiktari
        };
        MockData.Urunler.Add(entity);
        return Task.FromResult(MapToDto(entity));
    }

    public Task UpdateAsync(int id, UrunCreateDto dto)
    {
        var entity = MockData.Urunler.FirstOrDefault(u => u.Id == id);
        if (entity != null)
        {
            entity.Ad = dto.Ad;
            entity.Marka = dto.Marka;
            entity.Model = dto.Model;
            entity.SeriNumarasi = dto.SeriNumarasi;
            entity.Barkod = dto.Barkod;
            entity.KategoriId = dto.KategoriId;
            entity.DepoId = dto.DepoId;
            entity.EkParcaVar = dto.EkParcaVar;
            entity.Birim = Enum.Parse<Birim>(dto.Birim);
            entity.Maliyet = dto.Maliyet;
            entity.KdvOrani = dto.KdvOrani;
            entity.GarantiSuresiAy = dto.GarantiSuresiAy;
            entity.BozuldugundaBakimTipi = Enum.Parse<BakimTipi>(dto.BozuldugundaBakimTipi);
            entity.StokMiktari = dto.StokMiktari;
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        var entity = MockData.Urunler.FirstOrDefault(u => u.Id == id);
        if (entity != null) MockData.Urunler.Remove(entity);
        return Task.CompletedTask;
    }

    private static UrunDto MapToDto(Urun u) => new(
        u.Id, u.Ad, u.Marka, u.Model, u.SeriNumarasi, u.Barkod, u.KategoriId,
        MockData.Kategoriler.FirstOrDefault(k => k.Id == u.KategoriId)?.Ad,
        u.DepoId, MockData.Depolar.FirstOrDefault(d => d.Id == u.DepoId)?.Ad,
        u.EkParcaVar, u.Birim.ToString(), u.Maliyet, u.KdvOrani,
        u.GarantiSuresiAy, u.BozuldugundaBakimTipi.ToString(),
        u.StokMiktari, u.Durum.ToString()
    );
}

public class MockKategoriService : IKategoriService
{
    public Task<IEnumerable<KategoriDto>> GetAllAsync()
    {
        return Task.FromResult(MockData.Kategoriler.Select(MapToDto));
    }

    public Task<IEnumerable<KategoriDto>> GetAnaKategorilerAsync()
    {
        return Task.FromResult(MockData.Kategoriler.Where(k => k.UstKategoriId == null).Select(MapToDto));
    }

    public Task<IEnumerable<KategoriDto>> GetAltKategorilerAsync(int ustKategoriId)
    {
        return Task.FromResult(MockData.Kategoriler.Where(k => k.UstKategoriId == ustKategoriId).Select(MapToDto));
    }

    public Task<KategoriDto?> GetByIdAsync(int id)
    {
        var k = MockData.Kategoriler.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(k != null ? MapToDto(k) : null);
    }

    public Task<KategoriDto> CreateAsync(KategoriCreateDto dto)
    {
        var newId = MockData.Kategoriler.Max(k => k.Id) + 1;
        var entity = new Kategori { Id = newId, Ad = dto.Ad, Aciklama = dto.Aciklama, UstKategoriId = dto.UstKategoriId };
        MockData.Kategoriler.Add(entity);
        return Task.FromResult(MapToDto(entity));
    }

    public Task UpdateAsync(int id, KategoriCreateDto dto)
    {
        var entity = MockData.Kategoriler.FirstOrDefault(k => k.Id == id);
        if (entity != null)
        {
            entity.Ad = dto.Ad;
            entity.Aciklama = dto.Aciklama;
            entity.UstKategoriId = dto.UstKategoriId;
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        var entity = MockData.Kategoriler.FirstOrDefault(k => k.Id == id);
        if (entity != null) MockData.Kategoriler.Remove(entity);
        return Task.CompletedTask;
    }



    public Task<IEnumerable<CategoryDto>> GetCategoryTreeAsync()
    {
        var allCategories = MockData.Kategoriler;
        // Use ToLookup to handle null keys (root categories) and missing keys gracefully
        var categoriesLookup = allCategories.ToLookup(c => c.UstKategoriId);

        List<CategoryDto> BuildTree(int? parentId)
        {
            var children = categoriesLookup[parentId];

            return children.Select(c => new CategoryDto(
                c.Id,
                c.Ad,
                c.UstKategoriId,
                BuildTree(c.Id),
                MockData.Urunler.Count(u => u.KategoriId == c.Id)
            )).ToList();
        }

        return Task.FromResult<IEnumerable<CategoryDto>>(BuildTree(null));
    }

    private static KategoriDto MapToDto(Kategori k) => new(
        k.Id, k.Ad, k.Aciklama, k.UstKategoriId,
        MockData.Kategoriler.FirstOrDefault(x => x.Id == k.UstKategoriId)?.Ad,
        MockData.Kategoriler.Count(x => x.UstKategoriId == k.Id),
        MockData.Urunler.Count(u => u.KategoriId == k.Id)
    );
}

public class MockPersonelService : IPersonelService
{
    public Task<IEnumerable<PersonelDto>> GetAllAsync()
    {
        return Task.FromResult(MockData.Personeller.Select(MapToDto));
    }

    public Task<IEnumerable<PersonelDto>> SearchAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return Task.FromResult(MockData.Personeller.Where(p => p.TamAd.ToLower().Contains(term) || 
            (p.Departman?.ToLower().Contains(term) ?? false)).Select(MapToDto));
    }

    public Task<PersonelDto?> GetByIdAsync(int id)
    {
        var p = MockData.Personeller.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(p != null ? MapToDto(p) : null);
    }

    public Task<PersonelDto> CreateAsync(PersonelCreateDto dto)
    {
        var newId = MockData.Personeller.Max(p => p.Id) + 1;
        var entity = new Personel
        {
            Id = newId, Ad = dto.Ad, Soyad = dto.Soyad, TcNo = dto.TcNo,
            Departman = dto.Departman, Unvan = dto.Unvan, Telefon = dto.Telefon,
            Email = dto.Email, IseGirisTarihi = dto.IseGirisTarihi
        };
        MockData.Personeller.Add(entity);
        return Task.FromResult(MapToDto(entity));
    }

    public Task UpdateAsync(int id, PersonelCreateDto dto)
    {
        var entity = MockData.Personeller.FirstOrDefault(p => p.Id == id);
        if (entity != null)
        {
            entity.Ad = dto.Ad;
            entity.Soyad = dto.Soyad;
            entity.TcNo = dto.TcNo;
            entity.Departman = dto.Departman;
            entity.Unvan = dto.Unvan;
            entity.Telefon = dto.Telefon;
            entity.Email = dto.Email;
            entity.IseGirisTarihi = dto.IseGirisTarihi;
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        var entity = MockData.Personeller.FirstOrDefault(p => p.Id == id);
        if (entity != null) MockData.Personeller.Remove(entity);
        return Task.CompletedTask;
    }

    private static PersonelDto MapToDto(Personel p) => new(
        p.Id, p.Ad, p.Soyad, p.TamAd, p.TcNo, p.Departman, p.Unvan,
        p.Telefon, p.Email, p.IseGirisTarihi, p.Aktif,
        MockData.Zimmetler.Count(z => z.PersonelId == p.Id && z.Durum == ZimmetDurum.Aktif)
    );
}

public class MockCariService : ICariService
{
    public Task<IEnumerable<CariDto>> GetAllAsync()
    {
        return Task.FromResult(MockData.Cariler.Select(MapToDto));
    }

    public Task<IEnumerable<CariDto>> SearchAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return Task.FromResult(MockData.Cariler.Where(c => c.FirmaAdi.ToLower().Contains(term)).Select(MapToDto));
    }

    public Task<CariDto?> GetByIdAsync(int id)
    {
        var c = MockData.Cariler.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(c != null ? MapToDto(c) : null);
    }

    public Task<CariDto> CreateAsync(CariCreateDto dto)
    {
        var newId = MockData.Cariler.Max(c => c.Id) + 1;
        var entity = new Cari
        {
            Id = newId, FirmaAdi = dto.FirmaAdi, Tip = Enum.Parse<CariTipi>(dto.Tip),
            TicaretSicilNo = dto.TicaretSicilNo,
            VergiNo = dto.VergiNo, VergiDairesi = dto.VergiDairesi, Adres = dto.Adres,
            Il = dto.Il, Ilce = dto.Ilce, Telefon = dto.Telefon, Fax = dto.Fax,
            Email = dto.Email, WebSitesi = dto.WebSitesi, YetkiliKisi = dto.YetkiliKisi,
            YetkiliTelefon = dto.YetkiliTelefon, BankaAdi = dto.BankaAdi, IbanNo = dto.IbanNo
        };
        MockData.Cariler.Add(entity);
        return Task.FromResult(MapToDto(entity));
    }

    public Task UpdateAsync(int id, CariCreateDto dto)
    {
        var entity = MockData.Cariler.FirstOrDefault(c => c.Id == id);
        if (entity != null)
        {
            entity.FirmaAdi = dto.FirmaAdi;
            entity.Tip = Enum.Parse<CariTipi>(dto.Tip);
            entity.TicaretSicilNo = dto.TicaretSicilNo;
            entity.VergiNo = dto.VergiNo;
            entity.VergiDairesi = dto.VergiDairesi;
            entity.Adres = dto.Adres;
            entity.Il = dto.Il;
            entity.Ilce = dto.Ilce;
            entity.Telefon = dto.Telefon;
            entity.Fax = dto.Fax;
            entity.Email = dto.Email;
            entity.WebSitesi = dto.WebSitesi;
            entity.YetkiliKisi = dto.YetkiliKisi;
            entity.YetkiliTelefon = dto.YetkiliTelefon;
            entity.BankaAdi = dto.BankaAdi;
            entity.IbanNo = dto.IbanNo;
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        var entity = MockData.Cariler.FirstOrDefault(c => c.Id == id);
        if (entity != null) MockData.Cariler.Remove(entity);
        return Task.CompletedTask;
    }

    private static CariDto MapToDto(Cari c) => new(
        c.Id, c.FirmaAdi, c.Tip.ToString(), c.TicaretSicilNo, c.VergiNo, c.VergiDairesi, c.Adres,
        c.Il, c.Ilce, c.Telefon, c.Fax, c.Email, c.WebSitesi, c.YetkiliKisi,
        c.YetkiliTelefon, c.BankaAdi, c.IbanNo, c.Aktif
    );
}

public class MockFaturaService : IFaturaService
{
    public Task<IEnumerable<FaturaDto>> GetAllAsync()
    {
        return Task.FromResult(MockData.Faturalar.Select(MapToDto));
    }

    public Task<IEnumerable<FaturaDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return Task.FromResult(MockData.Faturalar.Where(f => f.FaturaTarihi >= startDate && f.FaturaTarihi <= endDate).Select(MapToDto));
    }

    public Task<IEnumerable<FaturaDto>> GetByCariIdAsync(int cariId)
    {
        return Task.FromResult(MockData.Faturalar.Where(f => f.CariId == cariId).Select(MapToDto));
    }

    public Task<FaturaDto?> GetByIdAsync(int id)
    {
        var f = MockData.Faturalar.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(f != null ? MapToDto(f) : null);
    }

    public Task<FaturaDto> CreateAsync(FaturaCreateDto dto)
    {
        var newId = MockData.Faturalar.Max(f => f.Id) + 1;
        decimal araToplam = 0, toplamIndirim = 0, toplamKdv = 0;

        var kalemler = dto.Kalemler.Select((k, index) =>
        {
            var kalemToplam = k.Miktar * k.BirimFiyat;
            var indirim = kalemToplam * (k.IndirimOrani / 100);
            var kdvMatrah = kalemToplam - indirim;
            var kdv = kdvMatrah * (k.KdvOrani / 100);
            araToplam += kalemToplam;
            toplamIndirim += indirim;
            toplamKdv += kdv;
            
            var kalemEntity = new FaturaKalemi
            {
                Id = MockData.FaturaKalemleri.Max(fk => fk.Id) + index + 1,
                FaturaId = newId, UrunId = k.UrunId, UrunAdi = k.UrunAdi,
                Miktar = k.Miktar, BirimFiyat = k.BirimFiyat, IndirimOrani = k.IndirimOrani,
                KdvOrani = k.KdvOrani, Toplam = kdvMatrah + kdv
            };
            MockData.FaturaKalemleri.Add(kalemEntity);
            return kalemEntity;
        }).ToList();

        var entity = new Fatura
        {
            Id = newId, FaturaNo = dto.FaturaNo, CariId = dto.CariId, FaturaTarihi = dto.FaturaTarihi,
            AraToplam = araToplam, ToplamIndirim = toplamIndirim, ToplamKdv = toplamKdv,
            GenelToplam = araToplam - toplamIndirim + toplamKdv, Aciklama = dto.Aciklama
        };
        MockData.Faturalar.Add(entity);
        return Task.FromResult(MapToDto(entity));
    }

    public Task DeleteAsync(int id)
    {
        var entity = MockData.Faturalar.FirstOrDefault(f => f.Id == id);
        if (entity != null)
        {
            MockData.FaturaKalemleri.RemoveAll(fk => fk.FaturaId == id);
            MockData.Faturalar.Remove(entity);
        }
        return Task.CompletedTask;
    }

    private static FaturaDto MapToDto(Fatura f) => new(
        f.Id, f.FaturaNo, f.CariId,
        MockData.Cariler.FirstOrDefault(c => c.Id == f.CariId)?.FirmaAdi ?? "",
        f.FaturaTarihi, f.AraToplam, f.ToplamIndirim, f.ToplamKdv, f.GenelToplam, f.Aciklama,
        MockData.FaturaKalemleri.Where(fk => fk.FaturaId == f.Id).Select(fk => new FaturaKalemiDto(
            fk.Id, fk.UrunId, fk.UrunAdi, fk.Miktar, fk.BirimFiyat, fk.IndirimOrani, fk.KdvOrani, fk.Toplam
        )).ToList()
    );
    public Task<FaturaCreateDto> CreateFromPdfAsync(Stream pdfStream)
    {
        // Mock processing logic
        return Task.FromResult(new FaturaCreateDto(
             "OCR-" + new Random().Next(10000, 99999),
             1, // Default Cari
             DateTime.Now,
             "PDF Otomatik Aktarım (Simülasyon)",
             new List<FaturaKalemiCreateDto>
             {
                 new(1, "Ürün 1", 10, 150, 0, 20),
                 new(2, "Ürün 2", 5, 300, 5, 20)
             }
        ));
    }
}

public class MockZimmetService : IZimmetService
{
    public Task<IEnumerable<ZimmetDto>> GetAllAsync()
    {
        return Task.FromResult(MockData.Zimmetler.Select(MapToDto));
    }

    public Task<IEnumerable<ZimmetDto>> GetSonZimmetlerAsync(int count)
    {
        return Task.FromResult(MockData.Zimmetler.OrderByDescending(z => z.ZimmetTarihi).Take(count).Select(MapToDto));
    }

    public Task<ZimmetDto?> GetByIdAsync(int id)
    {
        var z = MockData.Zimmetler.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(z != null ? MapToDto(z) : null);
    }

    public Task<ZimmetDto> CreateAsync(ZimmetCreateDto dto)
    {
        var newId = MockData.Zimmetler.Max(z => z.Id) + 1;
        var entity = new Zimmet
        {
            Id = newId, UrunId = dto.UrunId, PersonelId = dto.PersonelId, BolumId = dto.BolumId,
            ZimmetTarihi = dto.ZimmetTarihi, Aciklama = dto.Aciklama
        };
        MockData.Zimmetler.Add(entity);
        return Task.FromResult(MapToDto(entity));
    }

    public Task IadeEtAsync(int id)
    {
        var entity = MockData.Zimmetler.FirstOrDefault(z => z.Id == id);
        if (entity != null)
        {
            entity.Durum = ZimmetDurum.Iade;
            entity.IadeTarihi = DateTime.Now;
        }
        return Task.CompletedTask;
    }

    public Task UpdateAsync(int id, ZimmetUpdateDto dto)
    {
        var entity = MockData.Zimmetler.FirstOrDefault(z => z.Id == id);
        if (entity != null)
        {
            entity.UrunId = dto.UrunId;
            entity.PersonelId = dto.PersonelId;
            entity.BolumId = dto.BolumId;
            entity.ZimmetTarihi = dto.ZimmetTarihi;
            entity.Aciklama = dto.Aciklama;
            if (Enum.TryParse<ZimmetDurum>(dto.Durum, out var durum))
            {
                entity.Durum = durum;
            }
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(int id)
    {
        var entity = MockData.Zimmetler.FirstOrDefault(z => z.Id == id);
        if (entity != null) MockData.Zimmetler.Remove(entity);
        return Task.CompletedTask;
    }

    private static ZimmetDto MapToDto(Zimmet z) => new(
        z.Id, z.UrunId,
        MockData.Urunler.FirstOrDefault(u => u.Id == z.UrunId)?.Ad ?? "",
        z.PersonelId,
        MockData.Personeller.FirstOrDefault(p => p.Id == z.PersonelId)?.TamAd ?? "",
        z.BolumId,
        null, // Mock data does not have Bolumler yet
        z.ZimmetTarihi, z.IadeTarihi, z.Durum.ToString(), z.Aciklama
    );
}

public class MockDashboardService : IDashboardService
{
    private readonly MockUrunService _urunService = new();
    private readonly MockZimmetService _zimmetService = new();

    public async Task<DashboardDto> GetDashboardDataAsync()
    {
        var zimmetliPersoneller = MockData.Zimmetler
            .Where(z => z.Durum == ZimmetDurum.Aktif)
            .Select(z => z.PersonelId)
            .Distinct()
            .Count();

        var toplamStok = MockData.Urunler.Sum(u => u.StokMiktari);
        var toplamKategori = MockData.Kategoriler.Count;
        var bakimdakiUrunler = MockData.Urunler.Count(u => u.Durum == UrunDurum.Bakimda);
        var tamirBekleyenler = MockData.Urunler.Count(u => u.Durum == UrunDurum.TamirBekliyor);

        var sonZimmetler = (await _zimmetService.GetSonZimmetlerAsync(5)).ToList();
        
        var tamirBekleyenUrunler = MockData.Urunler
            .Where(u => u.Durum == UrunDurum.TamirBekliyor)
            .Select(u => new UrunDto(
                u.Id, u.Ad, u.Marka, u.Model, u.SeriNumarasi, u.Barkod, u.KategoriId,
                MockData.Kategoriler.FirstOrDefault(k => k.Id == u.KategoriId)?.Ad,
                u.DepoId, MockData.Depolar.FirstOrDefault(d => d.Id == u.DepoId)?.Ad,
                u.EkParcaVar, u.Birim.ToString(), u.Maliyet, u.KdvOrani,
                u.GarantiSuresiAy, u.BozuldugundaBakimTipi.ToString(),
                u.StokMiktari, u.Durum.ToString()
            )).ToList();

        var bakimdakiUrunList = MockData.Urunler
            .Where(u => u.Durum == UrunDurum.Bakimda)
            .Select(u => new UrunDto(
                u.Id, u.Ad, u.Marka, u.Model, u.SeriNumarasi, u.Barkod, u.KategoriId,
                MockData.Kategoriler.FirstOrDefault(k => k.Id == u.KategoriId)?.Ad,
                u.DepoId, MockData.Depolar.FirstOrDefault(d => d.Id == u.DepoId)?.Ad,
                u.EkParcaVar, u.Birim.ToString(), u.Maliyet, u.KdvOrani,
                u.GarantiSuresiAy, u.BozuldugundaBakimTipi.ToString(),
                u.StokMiktari, u.Durum.ToString()
            )).ToList();

        return new DashboardDto(
            zimmetliPersoneller, toplamStok, toplamKategori,
            bakimdakiUrunler, tamirBekleyenler, sonZimmetler, tamirBekleyenUrunler,
            new List<TalepDto>(),
            bakimdakiUrunList
        );
    }
}
