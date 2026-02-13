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
            k.Malzemeler.Count
        );
    }

    public async Task<IEnumerable<KategoriDto>> GetAllAsync()
    {
        var list = await _kategoriRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<PagedResultDto<KategoriDto>> GetPagedAsync(PaginationRequest request)
    {
        System.Linq.Expressions.Expression<Func<Kategori, bool>>? predicate = null;
        
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            predicate = x => x.Ad.Contains(request.SearchTerm);
        }

        var pagedResult = await _kategoriRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate,
            q => q.OrderBy(x => x.Ad), // Categories usually ordered by Name
            x => x.UstKategori,
            x => x.AltKategoriler
        );

        var dtos = pagedResult.Items.Select(MapToDto);
        
        return new PagedResultDto<KategoriDto>(
            dtos, 
            pagedResult.TotalCount, 
            pagedResult.PageNumber, 
            pagedResult.PageSize
        );
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
        // Check for dependencies
        var result = await _kategoriRepository.GetPagedAsync(1, 1, 
            x => x.Id == id, 
            null, 
            x => x.Malzemeler, 
            x => x.AltKategoriler);

        var entity = result.Items.FirstOrDefault();

        if (entity != null)
        {
            if (entity.Malzemeler.Any())
            {
                throw new DepoYonetim.Core.Exceptions.BusinessException($"Bu kategoriye ait {entity.Malzemeler.Count} adet malzeme bulunmaktadır. Kategori silinemez.");
            }

            if (entity.AltKategoriler.Any())
            {
                throw new DepoYonetim.Core.Exceptions.BusinessException($"Bu kategoriye bağlı {entity.AltKategoriler.Count} alt kategori bulunmaktadır. Önce alt kategorileri siliniz veya taşıyınız.");
            }

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
                c.Malzemeler.Count
            )).ToList();
        }

        return BuildTree(null);
    }
}
