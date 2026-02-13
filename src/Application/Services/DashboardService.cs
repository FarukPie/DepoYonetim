using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Core.Entities;

namespace DepoYonetim.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IZimmetRepository _zimmetRepository;
    private readonly IMalzemeKalemiRepository _malzemeRepository;
    private readonly IKategoriRepository _kategoriRepository;
    private readonly IPersonelRepository _personelRepository;
    private readonly IRepository<Talep> _talepRepository;

    public DashboardService(
        IZimmetRepository zimmetRepository,
        IMalzemeKalemiRepository malzemeRepository,
        IKategoriRepository kategoriRepository,
        IPersonelRepository personelRepository,
        IRepository<Talep> talepRepository)
    {
        _zimmetRepository = zimmetRepository;
        _malzemeRepository = malzemeRepository;
        _kategoriRepository = kategoriRepository;
        _personelRepository = personelRepository;
        _talepRepository = talepRepository;
    }

    public async Task<DashboardDto> GetDashboardDataAsync()
    {
        var zimmetliCalisanSayisi = await _personelRepository.GetZimmetliPersonelSayisiAsync();
        
        var malzemeler = await _malzemeRepository.GetAllAsync();
        // StokMiktari removed, assuming each row is 1 unit (Asset).
        var toplamStok = malzemeler.Count();
        
        var kategoriler = await _kategoriRepository.GetAllAsync();
        var toplamKategori = kategoriler.Count();
        
        var bakimdakiMalzemeler = await _malzemeRepository.GetBakimdakiMalzemelerAsync();
        var tamirBekleyenler = await _malzemeRepository.GetTamirBekleyenlerAsync();
        
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
            bakimdakiMalzemeler.Count(),
            tamirBekleyenler.Count(),
            sonZimmetler.Select(z => new ZimmetDto(
                z.Id,
                z.FaturaKalemiId,
                z.FaturaKalemi?.MalzemeAdi ?? "",
                z.FaturaKalemi?.SeriNumarasi,
                z.FaturaKalemi?.Barkod,
                z.PersonelId,
                z.Personel != null ? $"{z.Personel.Ad} {z.Personel.Soyad}" : null,
                z.Personel?.Departman,
                z.BolumId,
                z.Bolum?.Ad,
                z.ZimmetTarihi,
                z.IadeTarihi,
                z.Durum.ToString(),
                z.Aciklama
            )).ToList(),
            tamirBekleyenler.Select(m => new MalzemeKalemiDto(
                m.Id,
                m.Ad,
                m.DmbNo,
                m.EkParcaVar,
                m.ParcaAd,
                m.Birim.ToString(),
                m.Rutin,
                m.Aciklama,
                m.State,
                m.KategoriId,
                m.Kategori?.Ad
            )).ToList(),
            onaylananTalepler,
            bakimdakiMalzemeler.Select(m => new MalzemeKalemiDto(
                m.Id,
                m.Ad,
                m.DmbNo,
                m.EkParcaVar,
                m.ParcaAd,
                m.Birim.ToString(),
                m.Rutin,
                m.Aciklama,
                m.State,
                m.KategoriId,
                m.Kategori?.Ad
            )).ToList()
        );
    }
}
