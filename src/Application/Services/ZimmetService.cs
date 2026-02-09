using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class ZimmetService : IZimmetService
{
    private readonly IZimmetRepository _zimmetRepository;
    private readonly IUrunRepository _urunRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public ZimmetService(
        IZimmetRepository zimmetRepository,
        IUrunRepository urunRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _zimmetRepository = zimmetRepository;
        _urunRepository = urunRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }
    
    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    private ZimmetDto MapToDto(Zimmet z)
    {
        return new ZimmetDto(
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
        );
    }

    public async Task<IEnumerable<ZimmetDto>> GetAllAsync()
    {
        var list = await _zimmetRepository.GetAllAsync();
        return list.Select(MapToDto);
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

    public async Task<ZimmetDto> CreateAsync(ZimmetCreateDto dto)
    {
        // Check for existing active zimmet for this product and close it if exists (Re-assignment)
        var activeZimmets = await _zimmetRepository.FindAsync(z => z.UrunId == dto.UrunId && z.Durum == ZimmetDurum.Aktif);
        var activeZimmet = activeZimmets.FirstOrDefault();
        
        if (activeZimmet != null)
        {
            activeZimmet.Durum = ZimmetDurum.Iade;
            activeZimmet.IadeTarihi = DateTime.Now;
            activeZimmet.Aciklama = activeZimmet.Aciklama + " (Otomatik İade - Yeni Zimmetleme)";
            await _zimmetRepository.UpdateAsync(activeZimmet);

            await _logService.LogAsync(
                 "Update", "Zimmet", activeZimmet.Id, 
                 $"Ürün yeniden zimmetlendiği için önceki zimmet kapatıldı. ID: {activeZimmet.Id}", 
                 CurrentUserId, CurrentUserName, null);
        }

        var entity = new Zimmet
        {
            UrunId = dto.UrunId,
            PersonelId = dto.PersonelId,
            BolumId = dto.BolumId,
            ZimmetTarihi = dto.ZimmetTarihi,
            Aciklama = dto.Aciklama,
            Durum = ZimmetDurum.Aktif
        };

        var created = await _zimmetRepository.AddAsync(entity);

        // Update Product Status to Aktif (Assigned)
        var urun = await _urunRepository.GetByIdAsync(dto.UrunId);
        if (urun != null)
        {
            urun.Durum = UrunDurum.Aktif;
            await _urunRepository.UpdateAsync(urun);
        }
        
        // Retrieve full entity for logging details if possible, but basic info is enough
        await _logService.LogAsync(
             "Create", "Zimmet", created.Id, 
             $"Zimmet oluşturuldu. Ürün ID: {dto.UrunId}, " +
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

        // Update Product Status to Pasif (Unassigned/Available)
        var urun = await _urunRepository.GetByIdAsync(z.UrunId);
        if (urun != null)
        {
            urun.Durum = UrunDurum.Pasif;
            await _urunRepository.UpdateAsync(urun);
        }
        
        await _logService.LogAsync(
             "Update", "Zimmet", z.Id, 
             $"Zimmet iade edildi. ID: {id}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task UpdateAsync(int id, ZimmetUpdateDto dto)
    {
        var z = await _zimmetRepository.GetByIdAsync(id);
        if (z == null) return;

        z.UrunId = dto.UrunId;
        z.PersonelId = dto.PersonelId;
        z.BolumId = dto.BolumId;
        z.ZimmetTarihi = dto.ZimmetTarihi;
        z.Aciklama = dto.Aciklama;
        
        // Parse Durum string to enum
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

        await _zimmetRepository.DeleteAsync(id);

        // Update Product Status to Pasif (Unassigned/Available)
        var urun = await _urunRepository.GetByIdAsync(z.UrunId);
        if (urun != null)
        {
            urun.Durum = UrunDurum.Pasif;
            await _urunRepository.UpdateAsync(urun);
        }
        
        await _logService.LogAsync(
             "Delete", "Zimmet", id, 
             $"Zimmet silindi. ID: {id}", 
             CurrentUserId, CurrentUserName, null);
    }
}
