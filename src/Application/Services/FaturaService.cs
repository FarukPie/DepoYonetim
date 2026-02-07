using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class FaturaService : IFaturaService
{
    private readonly IFaturaRepository _faturaRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public FaturaService(
        IFaturaRepository faturaRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _faturaRepository = faturaRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }

    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

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
        
        await _logService.LogAsync(
             "Create", "Fatura", entity.Id, 
             $"Yeni fatura oluşturuldu. No: {entity.FaturaNo}, Cari: {entity.CariId}", 
             CurrentUserId, CurrentUserName, null);

        return MapToDto(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _faturaRepository.GetByIdAsync(id);
        if (entity != null)
        {
            await _faturaRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "Fatura", id, 
                 $"Fatura silindi. No: {entity.FaturaNo}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }

    public async Task<FaturaCreateDto> CreateFromPdfAsync(Stream pdfStream)
    {
        // Mock processing delay to simulate OCR
        await Task.Delay(1500);

        // Return mock data
        return new FaturaCreateDto(
            "OCR-" + new Random().Next(10000, 99999),
            1, // Default to first Cari
            DateTime.Now,
            "PDF Otomatik Aktarım (Simülasyon)",
            new List<FaturaKalemiCreateDto>
            {
                 new(1, "Ürün 1", 10, 150, 0, 20),
                 new(2, "Ürün 2", 5, 300, 5, 20)
            }
        );
    }
}
