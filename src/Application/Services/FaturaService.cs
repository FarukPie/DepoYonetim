using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class FaturaService : IFaturaService
{
    private readonly IFaturaRepository _faturaRepository;

    public FaturaService(IFaturaRepository faturaRepository)
    {
        _faturaRepository = faturaRepository;
    }

    private FaturaDto MapToDto(Fatura f)
    {
        return new FaturaDto(
            f.Id,
            f.FaturaNo,
            f.CariId,
            f.Cari?.FirmaAdi ?? "",
            f.FaturaTarihi,
            f.AraToplam,
            f.ToplamIndirim,
            f.ToplamKdv,
            f.GenelToplam,
            f.Aciklama,
            f.Kalemler.Select(k => new FaturaKalemiDto(
                k.Id,
                k.UrunId,
                k.Urun?.Ad ?? "",
                k.Miktar,
                k.BirimFiyat,
                k.IndirimOrani,
                k.KdvOrani,
                k.Toplam
            )).ToList()
        );
    }

    public async Task<IEnumerable<FaturaDto>> GetAllAsync()
    {
        var list = await _faturaRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<FaturaDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var list = await _faturaRepository.GetByDateRangeAsync(startDate, endDate);
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<FaturaDto>> GetByCariIdAsync(int cariId)
    {
        var list = await _faturaRepository.GetByCariIdAsync(cariId);
        return list.Select(MapToDto);
    }

    public async Task<FaturaDto?> GetByIdAsync(int id)
    {
        var f = await _faturaRepository.GetByIdAsync(id);
        return f == null ? null : MapToDto(f);
    }

    public async Task<FaturaDto> CreateAsync(FaturaCreateDto dto)
    {
        var entity = new Fatura
        {
            FaturaNo = dto.FaturaNo,
            CariId = dto.CariId,
            FaturaTarihi = dto.FaturaTarihi,
            Aciklama = dto.Aciklama,
            Kalemler = dto.Kalemler.Select(k => new FaturaKalemi
            {
                UrunId = k.UrunId,
                Miktar = k.Miktar,
                BirimFiyat = k.BirimFiyat,
                IndirimOrani = k.IndirimOrani,
                KdvOrani = k.KdvOrani,
                Toplam = k.Miktar * k.BirimFiyat * (1 - k.IndirimOrani/100) * (1 + k.KdvOrani/100)
            }).ToList()
        };
        
        entity.AraToplam = entity.Kalemler.Sum(k => k.Miktar * k.BirimFiyat);
        entity.ToplamIndirim = entity.Kalemler.Sum(k => k.Miktar * k.BirimFiyat * (k.IndirimOrani/100));
        var araAfterIndirim = entity.AraToplam - entity.ToplamIndirim;
        entity.ToplamKdv = entity.Kalemler.Sum(k => (k.Miktar * k.BirimFiyat * (1 - k.IndirimOrani/100)) * (k.KdvOrani/100));
        entity.GenelToplam = araAfterIndirim + entity.ToplamKdv;

        await _faturaRepository.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id)
    {
        await _faturaRepository.DeleteAsync(id);
    }
}
