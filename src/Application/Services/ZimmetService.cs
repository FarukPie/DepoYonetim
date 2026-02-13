using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class ZimmetService : IZimmetService
{
    private readonly IZimmetRepository _zimmetRepository;
    private readonly IMalzemeKalemiRepository _malzemeRepository;
    private readonly IRepository<FaturaKalemi> _faturaKalemiRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public ZimmetService(
        IZimmetRepository zimmetRepository,
        IMalzemeKalemiRepository malzemeRepository,
        IRepository<FaturaKalemi> faturaKalemiRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _zimmetRepository = zimmetRepository;
        _malzemeRepository = malzemeRepository;
        _faturaKalemiRepository = faturaKalemiRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }
    
    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    private ZimmetDto MapToDto(Zimmet z)
    {
        return new ZimmetDto(
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
        );
    }

    public async Task<IEnumerable<ZimmetDto>> GetAllAsync()
    {
        var list = await _zimmetRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<PagedResultDto<ZimmetDto>> GetPagedAsync(PaginationRequest request)
    {
        System.Linq.Expressions.Expression<Func<Zimmet, bool>>? predicate = null;
        
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            predicate = x => 
                (x.FaturaKalemi != null && x.FaturaKalemi.MalzemeAdi.Contains(request.SearchTerm)) ||
                (x.Personel != null && (x.Personel.Ad.Contains(request.SearchTerm) || x.Personel.Soyad.Contains(request.SearchTerm))) ||
                (x.Bolum != null && x.Bolum.Ad.Contains(request.SearchTerm));
        }

        var pagedResult = await _zimmetRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate,
            q => q.OrderByDescending(x => x.ZimmetTarihi),
            x => x.FaturaKalemi, 
            x => x.Personel, 
            x => x.Bolum
        );

        var dtos = pagedResult.Items.Select(MapToDto);
        
        return new PagedResultDto<ZimmetDto>(
            dtos, 
            pagedResult.TotalCount, 
            pagedResult.PageNumber, 
            pagedResult.PageSize
        );
    }

    public async Task<IEnumerable<ZimmetDto>> GetSonZimmetlerAsync(int count)
    {
        var list = await _zimmetRepository.GetSonZimmetlerAsync(count);
        return list.Select(MapToDto);
    }

    public async Task<ZimmetDto?> GetByIdAsync(int id)
    {
        var z = await _zimmetRepository.GetByIdAsync(id);
        return z == null ? null : MapToDto(z);
    }

    public async Task<IEnumerable<ZimmetDto>> GetByPersonelIdAsync(int personelId)
    {
        var list = await _zimmetRepository.GetByPersonelIdAsync(personelId);
        return list.Select(MapToDto);
    }

    public async Task<ZimmetDto> CreateAsync(ZimmetCreateDto dto)
    {
        // Check for existing active zimmet for this fatura kalemi and close it if exists
        var activeZimmets = await _zimmetRepository.FindAsync(z => z.FaturaKalemiId == dto.FaturaKalemiId && z.Durum == ZimmetDurum.Aktif);
        var activeZimmet = activeZimmets.FirstOrDefault();
        
        if (activeZimmet != null)
        {
            activeZimmet.Durum = ZimmetDurum.Iade;
            activeZimmet.IadeTarihi = DateTime.Now;
            activeZimmet.Aciklama = activeZimmet.Aciklama + " (Otomatik İade - Yeni Zimmetleme)";
            await _zimmetRepository.UpdateAsync(activeZimmet);

            await _logService.LogAsync(
                 "Update", "Zimmet", activeZimmet.Id, 
                 $"Fatura kalemi yeniden zimmetlendiği için önceki zimmet kapatıldı. ID: {activeZimmet.Id}", 
                 CurrentUserId, CurrentUserName, null);
        }

        var entity = new Zimmet
        {
            FaturaKalemiId = dto.FaturaKalemiId,
            PersonelId = dto.PersonelId,
            BolumId = dto.BolumId,
            ZimmetTarihi = dto.ZimmetTarihi,
            Aciklama = dto.Aciklama,
            Durum = ZimmetDurum.Aktif
        };

        var created = await _zimmetRepository.AddAsync(entity);

        // Fatura kaleminin ZimmetDurum alanını güncelle
        await UpdateFaturaKalemiZimmetDurumAsync(dto.FaturaKalemiId, true);
        
        await _logService.LogAsync(
             "Create", "Zimmet", created.Id, 
             $"Zimmet oluşturuldu. FaturaKalemi ID: {dto.FaturaKalemiId}, " +
             (dto.PersonelId.HasValue ? $"Personel ID: {dto.PersonelId}" : $"Bölüm ID: {dto.BolumId}"), 
             CurrentUserId, CurrentUserName, null);
        
        return await GetByIdAsync(created.Id) ?? MapToDto(created);
    }

    public async Task IadeEtAsync(int id)
    {
        var z = await _zimmetRepository.GetByIdAsync(id);
        if (z == null) return;

        z.Durum = ZimmetDurum.Iade;
        z.IadeTarihi = DateTime.Now;

        await _zimmetRepository.UpdateAsync(z);

        // İade sonrası fatura kaleminin ZimmetDurum alanını güncelle
        await UpdateFaturaKalemiZimmetDurumAsync(z.FaturaKalemiId, false);
        
        await _logService.LogAsync(
             "Update", "Zimmet", z.Id, 
             $"Zimmet iade edildi. ID: {id}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task UpdateAsync(int id, ZimmetUpdateDto dto)
    {
        var z = await _zimmetRepository.GetByIdAsync(id);
        if (z == null) return;

        z.FaturaKalemiId = dto.FaturaKalemiId;
        z.PersonelId = dto.PersonelId;
        z.BolumId = dto.BolumId;
        z.ZimmetTarihi = dto.ZimmetTarihi;
        z.Aciklama = dto.Aciklama;
        
        if (Enum.TryParse<ZimmetDurum>(dto.Durum, out var durum))
        {
            z.Durum = durum;
        }

        await _zimmetRepository.UpdateAsync(z);
        
        await _logService.LogAsync(
             "Update", "Zimmet", z.Id, 
             $"Zimmet güncellendi. ID: {id}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        var z = await _zimmetRepository.GetByIdAsync(id);
        if (z == null) return;

        var faturaKalemiId = z.FaturaKalemiId;
        await _zimmetRepository.DeleteAsync(id);

        // Silme sonrası fatura kaleminin ZimmetDurum alanını güncelle
        await UpdateFaturaKalemiZimmetDurumAsync(faturaKalemiId, false);
        
        await _logService.LogAsync(
             "Delete", "Zimmet", id, 
             $"Zimmet silindi. ID: {id}", 
             CurrentUserId, CurrentUserName, null);
    }

    /// <summary>
    /// FaturaKalemi.ZimmetDurum alanını günceller.
    /// </summary>
    private async Task UpdateFaturaKalemiZimmetDurumAsync(int faturaKalemiId, bool durum)
    {
        var faturaKalemi = await _faturaKalemiRepository.GetByIdAsync(faturaKalemiId);
        if (faturaKalemi == null) return;

        faturaKalemi.ZimmetDurum = durum;
        await _faturaKalemiRepository.UpdateAsync(faturaKalemi);
    }
}
