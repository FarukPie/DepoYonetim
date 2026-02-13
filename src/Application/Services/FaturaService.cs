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
            f.Kalemler.Sum(k => k.BirimFiyat), 
            0, 
            0, 
            f.Kalemler.Sum(k => k.BirimFiyat), 
            f.Aciklama,
            f.Kalemler.Select(k => new FaturaKalemiDto(
                k.Id,
                k.MalzemeKalemiId,
                k.MalzemeAdi,
                k.Miktar,
                k.BirimFiyat,
                k.IndirimOrani,
                k.KdvOrani,
                k.Toplam,
                k.ZimmetDurum,
                k.SeriNumarasi,
                k.Barkod
            )).ToList()
        );
    }

    public async Task<IEnumerable<FaturaDto>> GetAllAsync()
    {
        var list = await _faturaRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<PagedResultDto<FaturaDto>> GetPagedAsync(PaginationRequest request)
    {
        System.Linq.Expressions.Expression<Func<Fatura, bool>>? predicate = null;
        
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            predicate = x => x.FaturaNo.Contains(request.SearchTerm) || (x.Cari != null && x.Cari.FirmaAdi.Contains(request.SearchTerm));
        }

        var pagedResult = await _faturaRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate,
            q => q.OrderByDescending(x => x.FaturaTarihi),
            x => x.Cari,
            x => x.Kalemler
        );

        var dtos = pagedResult.Items.Select(MapToDto);
        
        return new PagedResultDto<FaturaDto>(
            dtos, 
            pagedResult.TotalCount, 
            pagedResult.PageNumber, 
            pagedResult.PageSize
        );
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
                MalzemeKalemiId = k.MalzemeKalemiId,
                MalzemeAdi = k.MalzemeAdi,
                Miktar = k.Miktar,
                BirimFiyat = k.BirimFiyat,
                IndirimOrani = k.IndirimOrani,
                KdvOrani = k.KdvOrani,
                ZimmetDurum = k.ZimmetDurum,
                SeriNumarasi = k.SeriNumarasi,
                Barkod = k.Barkod,
                Toplam = k.Miktar * k.BirimFiyat * (1 - k.IndirimOrani/100) * (1 + k.KdvOrani/100)
            }).ToList()
        };
        
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
        await Task.Delay(1500);

        return new FaturaCreateDto(
            "OCR-" + new Random().Next(10000, 99999),
            1, 
            DateTime.Now,
            "PDF Otomatik Aktarım (Simülasyon)",
            new List<FaturaKalemiCreateDto>
            {
                 new(1, "Malzeme 1", 10, 150, 0, 20, false, null, null),
                 new(2, "Malzeme 2", 5, 300, 5, 20, true, null, null)
            }
        );
    }
}
