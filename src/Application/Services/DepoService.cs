using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;


namespace DepoYonetim.Application.Services;

public class DepoService : IDepoService
{
    private readonly IDepoRepository _depoRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public DepoService(
        IDepoRepository depoRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _depoRepository = depoRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }

    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    public async Task<IEnumerable<DepoDto>> GetAllAsync()
    {
        var depos = await _depoRepository.GetAllAsync();
        return depos.Select(d => new DepoDto(
            d.Id,
            d.Ad,
            d.Aciklama,
            d.SorumluPersonelId,
            d.SorumluPersonel != null ? $"{d.SorumluPersonel.Ad} {d.SorumluPersonel.Soyad}" : null,
            d.Aktif,
            d.Urunler.Count
        ));
    }

    public async Task<DepoDto?> GetByIdAsync(int id)
    {
        var d = await _depoRepository.GetByIdAsync(id);
        if (d == null) return null;
        
        return new DepoDto(
            d.Id,
            d.Ad,
            d.Aciklama,
            d.SorumluPersonelId,
            d.SorumluPersonel != null ? $"{d.SorumluPersonel.Ad} {d.SorumluPersonel.Soyad}" : null,
            d.Aktif,
            d.Urunler.Count
        );
    }

    public async Task<DepoDto> CreateAsync(DepoCreateDto dto)
    {
        var entity = new Depo
        {
            Ad = dto.Ad,
            Aciklama = dto.Aciklama,
            SorumluPersonelId = dto.SorumluPersonelId,
            Aktif = dto.Aktif
        };
        
        await _depoRepository.AddAsync(entity);
        
        await _logService.LogAsync(
             "Create", "Depo", entity.Id, 
             $"Yeni depo eklendi: {entity.Ad}", 
             CurrentUserId, CurrentUserName, null);
        
        return new DepoDto(
            entity.Id,
            entity.Ad,
            entity.Aciklama,
            entity.SorumluPersonelId,
            null,
            entity.Aktif,
            0
        );
    }

    public async Task UpdateAsync(int id, DepoUpdateDto dto)
    {
        var entity = await _depoRepository.GetByIdAsync(id);
        if (entity == null) return;
        
        var oldName = entity.Ad;

        entity.Ad = dto.Ad;
        entity.Aciklama = dto.Aciklama;
        entity.SorumluPersonelId = dto.SorumluPersonelId;
        entity.Aktif = dto.Aktif;

        await _depoRepository.UpdateAsync(entity);
        
        await _logService.LogAsync(
             "Update", "Depo", entity.Id, 
             $"Depo güncellendi: {oldName} -> {entity.Ad}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _depoRepository.GetByIdAsync(id);
        if (entity != null)
        {
            await _depoRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "Depo", id, 
                 $"Depo silindi: {entity.Ad}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }
}
