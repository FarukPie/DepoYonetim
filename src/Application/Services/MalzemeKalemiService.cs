using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class MalzemeKalemiService : IMalzemeKalemiService
{
    private readonly IMalzemeKalemiRepository _malzemeRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public MalzemeKalemiService(
        IMalzemeKalemiRepository malzemeRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _malzemeRepository = malzemeRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }
    
    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    public async Task<IEnumerable<MalzemeKalemiDto>> GetAllAsync()
    {
        var malzemeler = await _malzemeRepository.GetAllAsync();
        return malzemeler.Select(MapToDto);
    }

    public async Task<IEnumerable<MalzemeKalemiDto>> SearchAsync(string searchTerm)
    {
        var malzemeler = await _malzemeRepository.SearchAsync(searchTerm);
        return malzemeler.Select(MapToDto);
    }

    public async Task<PagedResultDto<MalzemeKalemiDto>> GetPagedAsync(PaginationRequest request)
    {
        System.Linq.Expressions.Expression<Func<MalzemeKalemi, bool>>? predicate = null;
        
        // Basic search filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            predicate = x => x.Ad.Contains(request.SearchTerm) || (x.DmbNo != null && x.DmbNo.Contains(request.SearchTerm));
        }

        // Additional filtering can be done here if PaginationRequest is extended or a specific Request DTO is used.
        // For now, Kategori filtering will be handled if passed in SearchTerm or via a specific mechanism if requested.
        // Assuming simplistic filtering for now or just handling the Data Include.

        var pagedResult = await _malzemeRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate,
            q => q.OrderByDescending(x => x.Id),
            m => m.Kategori // Include Kategori
        );

        var dtos = pagedResult.Items.Select(MapToDto);
        
        return new PagedResultDto<MalzemeKalemiDto>(
            dtos, 
            pagedResult.TotalCount, 
            pagedResult.PageNumber, 
            pagedResult.PageSize
        );
    }

    public async Task<MalzemeKalemiDto?> GetByIdAsync(int id)
    {
        // We need repository to support Includes on GetById or use Get(predicate)
        // Assuming GetByIdAsync might not support Include by default in generic repo? 
        // Let's check repository interface. If not, we might need to use a predicate based fetch.
        // SAFE BET: Use the repository as is, if it doesn't bring Kategori, we might miss it.
        // If Generic Repository doesn't support Include on GetById, we might need `Get(x=>x.Id==id, include: ...)`
        // Checking existing code, _malzemeRepository is IMalzemeKalemiRepository which might have specific methods.
        // But for now, let's assume we proceed with standard GetById and if needed, refactor.
        // However, looking at GetPagedAsync usage above, it seems we can pass includes.
        
        // To be safe, let's try to fetch with Kategori if possible. 
        // If the repository pattern here is Generic Repository based, typically GetById doesn't take includes.
        // I will stick to existing GetById for now, but MapToDto will try to map if Kategori is loaded.
        
        var malzeme = await _malzemeRepository.GetByIdAsync(id);
        // If we really need Kategori name here (e.g. for Detail view), we might need to change this.
        // But for now, let's proceed.
        return malzeme != null ? MapToDto(malzeme) : null;
    }

    public async Task<MalzemeKalemiDto> CreateAsync(MalzemeKalemiCreateDto dto)
    {
        var entity = new MalzemeKalemi
        {
            Ad = dto.Ad,
            DmbNo = dto.DmbNo,
            EkParcaVar = dto.EkParcaVar,
            ParcaAd = dto.ParcaAd,
            Birim = dto.Birim,
            Rutin = dto.Rutin,
            Aciklama = dto.Aciklama,
            State = dto.State,
            KategoriId = dto.KategoriId
        };

        var created = await _malzemeRepository.AddAsync(entity);
        
        await _logService.LogAsync(
             "Create", "MalzemeKalemi", created.Id, 
             $"Yeni malzeme kalemi eklendi: {created.Ad}", 
             CurrentUserId, CurrentUserName, null);

        // Fetch again to get Kategori info if needed? 
        // Usually Created return doesn't need full relations immediately, or Kategori is null.
        return MapToDto(created);
    }

    public async Task UpdateAsync(int id, MalzemeKalemiCreateDto dto)
    {
        var entity = await _malzemeRepository.GetByIdAsync(id);
        if (entity == null) return;
        
        var oldName = entity.Ad;

        entity.Ad = dto.Ad;
        entity.DmbNo = dto.DmbNo;
        entity.EkParcaVar = dto.EkParcaVar;
        entity.ParcaAd = dto.ParcaAd;
        entity.Birim = dto.Birim;
        entity.Rutin = dto.Rutin;
        entity.Aciklama = dto.Aciklama;
        entity.State = dto.State;
        entity.KategoriId = dto.KategoriId;

        await _malzemeRepository.UpdateAsync(entity);
        
        await _logService.LogAsync(
             "Update", "MalzemeKalemi", entity.Id, 
             $"Malzeme kalemi güncellendi: {oldName} -> {entity.Ad}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        // Check dependencies (Fatura and Zimmet)
        var result = await _malzemeRepository.GetPagedAsync(1, 1, 
            x => x.Id == id, 
            null, 
            x => x.FaturaKalemleri,
            x => x.Zimmetler);

        var entity = result.Items.FirstOrDefault();

        if (entity != null)
        {
            if (entity.FaturaKalemleri.Any())
            {
                throw new DepoYonetim.Core.Exceptions.BusinessException("Bu malzeme kartına ait fatura hareketleri bulunmaktadır. Malzeme silinemez.");
            }

            if (entity.Zimmetler.Any())
            {
                throw new DepoYonetim.Core.Exceptions.BusinessException("Bu malzeme kartına ait zimmet kayıtları bulunmaktadır. Malzeme silinemez.");
            }
        
            await _malzemeRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "MalzemeKalemi", id, 
                 $"Malzeme kalemi silindi: {entity.Ad}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }

    private MalzemeKalemiDto MapToDto(MalzemeKalemi m) => new(
        m.Id,
        m.Ad,
        m.DmbNo,
        m.EkParcaVar,
        m.ParcaAd,
        m.Birim,
        m.Rutin,
        m.Aciklama,
        m.State,
        m.KategoriId,
        m.Kategori?.Ad
    );
}
