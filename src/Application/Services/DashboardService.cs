using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IZimmetRepository _zimmetRepository;
    private readonly IUrunRepository _urunRepository;
    private readonly IKategoriRepository _kategoriRepository;
    private readonly IPersonelRepository _personelRepository;

    public DashboardService(
        IZimmetRepository zimmetRepository,
        IUrunRepository urunRepository,
        IKategoriRepository kategoriRepository,
        IPersonelRepository personelRepository)
    {
        _zimmetRepository = zimmetRepository;
        _urunRepository = urunRepository;
        _kategoriRepository = kategoriRepository;
        _personelRepository = personelRepository;
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
                z.Personel != null ? $"{z.Personel.Ad} {z.Personel.Soyad}" : "",
                z.ZimmetTarihi,
                z.IadeTarihi,
                z.Durum.ToString(),
                z.Aciklama
            )).ToList(),
            tamirBekleyenler.Select(u => new UrunDto(
                u.Id,
                u.Ad,
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
