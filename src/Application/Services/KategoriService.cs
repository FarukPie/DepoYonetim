using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;


namespace DepoYonetim.Application.Services;

public class KategoriService : IKategoriService
{
    private readonly IKategoriRepository _kategoriRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public KategoriService(
        IKategoriRepository kategoriRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _kategoriRepository = kategoriRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }
    
    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    private KategoriDto MapToDto(Kategori k)
    {
        return new KategoriDto(
            k.Id,
            k.Ad,
            k.Aciklama,
            k.UstKategoriId,
            k.UstKategori?.Ad,
            k.AltKategoriler.Count,
            k.Urunler.Count
        );
    }

    public async Task<IEnumerable<KategoriDto>> GetAllAsync()
    {
        var list = await _kategoriRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<KategoriDto>> GetAnaKategorilerAsync()
    {
        var list = await _kategoriRepository.GetAnaKategorilerAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<KategoriDto>> GetAltKategorilerAsync(int ustKategoriId)
    {
        var list = await _kategoriRepository.GetAltKategorilerAsync(ustKategoriId);
        return list.Select(MapToDto);
    }

    public async Task<KategoriDto?> GetByIdAsync(int id)
    {
        var k = await _kategoriRepository.GetByIdAsync(id);
        return k == null ? null : MapToDto(k);
    }

    public async Task<KategoriDto> CreateAsync(KategoriCreateDto dto)
    {
        var entity = new Kategori
        {
            Ad = dto.Ad,
            Aciklama = dto.Aciklama,
            UstKategoriId = dto.UstKategoriId
        };

        await _kategoriRepository.AddAsync(entity);
        
        await _logService.LogAsync(
             "Create", "Kategori", entity.Id, 
             $"Yeni kategori eklendi: {entity.Ad}", 
             CurrentUserId, CurrentUserName, null);

        return MapToDto(entity);
    }

    public async Task UpdateAsync(int id, KategoriCreateDto dto)
    {
        var entity = await _kategoriRepository.GetByIdAsync(id);
        if (entity == null) return;
        
        var oldName = entity.Ad;

        entity.Ad = dto.Ad;
        entity.Aciklama = dto.Aciklama;
        entity.UstKategoriId = dto.UstKategoriId;

        await _kategoriRepository.UpdateAsync(entity);
        
        await _logService.LogAsync(
             "Update", "Kategori", entity.Id, 
             $"Kategori güncellendi: {oldName} -> {entity.Ad}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _kategoriRepository.GetByIdAsync(id);
        if (entity != null)
        {
            await _kategoriRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "Kategori", id, 
                 $"Kategori silindi: {entity.Ad}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }

    public async Task<IEnumerable<CategoryDto>> GetCategoryTreeAsync()
    {
        var allCategories = await _kategoriRepository.GetAllAsync();
        // Use ToLookup to handle null keys (root categories) and missing keys gracefully
        var categoriesLookup = allCategories.ToLookup(c => c.UstKategoriId);

        List<CategoryDto> BuildTree(int? parentId)
        {
            var children = categoriesLookup[parentId];

            return children.Select(c => new CategoryDto(
                c.Id,
                c.Ad,
                c.UstKategoriId,
                BuildTree(c.Id),
                c.Urunler?.Count ?? 0
            )).ToList();
        }

        return BuildTree(null);
    }
}
