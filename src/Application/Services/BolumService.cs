using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Core.Enums;

namespace DepoYonetim.Application.Services;

public class BolumService : IBolumService
{
    private readonly IBolumRepository _bolumRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public BolumService(
        IBolumRepository bolumRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _bolumRepository = bolumRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }
    
    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    private BolumDto MapToDto(Bolum b)
    {
        return new BolumDto(
            b.Id,
            b.Ad,
            b.Kod,
            b.Tip.ToString(), // Enum to String
            b.UstBolumId,
            new List<BolumDto>(), // SubLocations will be populated in GetTree logic or if recursive mapping needed
            b.Aciklama
        );
    }

    public async Task<IEnumerable<BolumDto>> GetAllAsync()
    {
        var list = await _bolumRepository.GetAllAsync();
        // Return flat list primarily? Or let frontend handle?
        // Usually GetAll implies flat list.
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<BolumDto>> GetTreeAsync()
    {
        var allBolums = await _bolumRepository.GetAllAsync();
        // Use ToLookup for efficient tree building and null key handling
        var bolumsLookup = allBolums.ToLookup(b => b.UstBolumId);

        List<BolumDto> BuildTree(int? parentId)
        {
            var children = bolumsLookup[parentId];

            return children.Select(b => new BolumDto(
                b.Id,
                b.Ad,
                b.Kod,
                b.Tip.ToString(),
                b.UstBolumId,
                BuildTree(b.Id),
                b.Aciklama
            )).ToList();
        }

        return BuildTree(null);
    }

    public async Task<BolumDto?> GetByIdAsync(int id)
    {
        var b = await _bolumRepository.GetByIdAsync(id);
        return b == null ? null : MapToDto(b);
    }

    public async Task<BolumDto> CreateAsync(BolumCreateDto dto)
    {
        if (!Enum.TryParse<BolumTip>(dto.Tip, out var tipEnum))
        {
            // Fallback or Error? Default to Oda if unknown?
            // Or assume validated frontend.
            tipEnum = BolumTip.Oda; 
        }

        var entity = new Bolum
        {
            Ad = dto.Ad,
            Kod = dto.Kod,
            Aciklama = dto.Aciklama,
            UstBolumId = dto.UstBolumId,
            Tip = tipEnum
        };

        await _bolumRepository.AddAsync(entity);
        
        await _logService.LogAsync(
             "Create", "Bolum", entity.Id, 
             $"Yeni bölüm eklendi: {entity.Ad} ({entity.Tip})", 
             CurrentUserId, CurrentUserName, null);

        return MapToDto(entity);
    }

    public async Task UpdateAsync(int id, BolumCreateDto dto)
    {
        var entity = await _bolumRepository.GetByIdAsync(id);
        if (entity == null) return;
        
        var oldName = entity.Ad;

        entity.Ad = dto.Ad;
        entity.Kod = dto.Kod;
        entity.Aciklama = dto.Aciklama;
        entity.UstBolumId = dto.UstBolumId;
        
        if (Enum.TryParse<BolumTip>(dto.Tip, out var tipEnum))
        {
             entity.Tip = tipEnum;
        }

        await _bolumRepository.UpdateAsync(entity);
        
        try
        {
            await _logService.LogAsync(
                 "Update", "Bolum", entity.Id, 
                 $"Bölüm güncellendi: {oldName} -> {entity.Ad}", 
                 CurrentUserId, CurrentUserName, null);
        }
        catch (Exception ex)
        {
            // Logging failed but update succeeded - don't fail the operation
            Console.WriteLine($"LOGGING ERROR: {ex.Message}");
        }
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _bolumRepository.GetByIdAsync(id);
        if (entity != null)
        {
            var entityName = entity.Ad; // Store before delete
            await _bolumRepository.DeleteAsync(id);
            
            try
            {
                await _logService.LogAsync(
                     "Delete", "Bolum", id, 
                     $"Bölüm silindi: {entityName}", 
                     CurrentUserId, CurrentUserName, null);
            }
            catch (Exception ex)
            {
                // Logging failed but delete succeeded - don't fail the operation
                Console.WriteLine($"LOGGING ERROR: {ex.Message}");
            }
        }
    }
}
