using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Core.Entities;

namespace DepoYonetim.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IZimmetRepository _zimmetRepository;
    private readonly IUrunRepository _urunRepository;
    private readonly IKategoriRepository _kategoriRepository;
    private readonly IPersonelRepository _personelRepository;
    private readonly IRepository<Talep> _talepRepository;

    public DashboardService(
        IZimmetRepository zimmetRepository,
        IUrunRepository urunRepository,
        IKategoriRepository kategoriRepository,
        IPersonelRepository personelRepository,
        IRepository<Talep> talepRepository)
    {
        _zimmetRepository = zimmetRepository;
        _urunRepository = urunRepository;
        _kategoriRepository = kategoriRepository;
        _personelRepository = personelRepository;
        _talepRepository = talepRepository;
    }

    public async Task<DashboardDto> GetDashboardDataAsync()
    {
        var zimmetliCalisanSayisi = await _personelRepository.GetZimmetliPersonelSayisiAsync();
        
        var urunler = await _urunRepository.GetAllAsync();
        var toplamStok = urunler.Sum(u => u.StokMiktari);
        
        var kategoriler = await _kategoriRepository.GetAllAsync();
        var toplamKategori = kategoriler.Count();
        
        var bakimdakiUrunler = await _urunRepository.GetBakimdakiUrunlerAsync();
        var tamirBekleyenler = await _urunRepository.GetTamirBekleyenlerAsync();
        
        var sonZimmetler = await _zimmetRepository.GetSonZimmetlerAsync(5);

        // Fetch Approved Requests
        var talepler = await _talepRepository.GetAllAsync();
        var onaylananTalepler = talepler
            .Where(t => t.Durum == "Onaylandi")
            .OrderByDescending(t => t.OnayTarihi)
            .Take(5)
            .Select(t => new TalepDto(
                t.Id,
                t.TalepTipi ?? string.Empty,
                t.TalepEdenUserId,
                t.TalepEdenUserName ?? string.Empty,
                t.Baslik ?? string.Empty,
                t.Detaylar ?? string.Empty,
                t.TalepData ?? string.Empty,
                t.Durum ?? string.Empty,
                t.OnaylayanUserId,
                t.OnaylayanUserName,
                t.OnayTarihi,
                t.RedNedeni,
                t.OlusturmaTarihi
            ))
            .ToList();

        return new DashboardDto(
            zimmetliCalisanSayisi,
            toplamStok,
            toplamKategori,
            bakimdakiUrunler.Count(),
            tamirBekleyenler.Count(),
            sonZimmetler.Select(z => new ZimmetDto(
                z.Id,
                z.UrunId,
                z.Urun?.Ad ?? "",
                z.PersonelId,
                z.Personel != null ? $"{z.Personel.Ad} {z.Personel.Soyad}" : null,
                z.BolumId,
                z.Bolum?.Ad,
                z.ZimmetTarihi,
                z.IadeTarihi,
                z.Durum.ToString(),
                z.Aciklama
            )).ToList(),
            tamirBekleyenler.Select(u => new UrunDto(
                u.Id,
                u.Ad,
                u.Marka,
                u.Model,
                u.SeriNumarasi,
                u.Barkod,
                u.KategoriId,
                u.Kategori?.Ad,
                u.DepoId,
                u.Depo?.Ad,
                u.EkParcaVar,
                u.Birim.ToString(),
                u.Maliyet,
                u.KdvOrani,
                u.GarantiSuresiAy,
                u.BozuldugundaBakimTipi.ToString(),
                u.StokMiktari,
                u.Durum.ToString()
            )).ToList(),
            onaylananTalepler,
            bakimdakiUrunler.Select(u => new UrunDto(
                u.Id,
                u.Ad,
                u.Marka,
                u.Model,
                u.SeriNumarasi,
                u.Barkod,
                u.KategoriId,
                u.Kategori?.Ad,
                u.DepoId,
                u.Depo?.Ad,
                u.EkParcaVar,
                u.Birim.ToString(),
                u.Maliyet,
                u.KdvOrani,
                u.GarantiSuresiAy,
                u.BozuldugundaBakimTipi.ToString(),
                u.StokMiktari,
                u.Durum.ToString()
            )).ToList()
        );
    }
}
