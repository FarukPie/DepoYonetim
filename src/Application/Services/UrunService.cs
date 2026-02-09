using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class UrunService : IUrunService
{
    private readonly IUrunRepository _urunRepository;
    private readonly IKategoriRepository _kategoriRepository;
    private readonly IDepoRepository _depoRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public UrunService(
        IUrunRepository urunRepository,
        IKategoriRepository kategoriRepository,
        IDepoRepository depoRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _urunRepository = urunRepository;
        _kategoriRepository = kategoriRepository;
        _depoRepository = depoRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }
    
    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    public async Task<IEnumerable<UrunDto>> GetAllAsync()
    {
        var urunler = await _urunRepository.GetAllAsync();
        return urunler.Select(MapToDto);
    }

    public async Task<IEnumerable<UrunDto>> GetByDepoIdAsync(int depoId)
    {
        var urunler = await _urunRepository.GetByDepoIdAsync(depoId);
        return urunler.Select(MapToDto);
    }

    public async Task<IEnumerable<UrunDto>> SearchAsync(string searchTerm)
    {
        var urunler = await _urunRepository.SearchAsync(searchTerm);
        return urunler.Select(MapToDto);
    }

    public async Task<UrunDto?> GetByIdAsync(int id)
    {
        var urun = await _urunRepository.GetByIdAsync(id);
        return urun != null ? MapToDto(urun) : null;
    }

    public async Task<UrunDto> CreateAsync(UrunCreateDto dto)
    {
        var entity = new Urun
        {
            Ad = dto.Ad,
            Marka = dto.Marka,
            Model = dto.Model,
            SeriNumarasi = dto.SeriNumarasi,
            Barkod = dto.Barkod,
            KategoriId = dto.KategoriId,
            DepoId = dto.DepoId,
            EkParcaVar = dto.EkParcaVar,
            Birim = Enum.Parse<Birim>(dto.Birim),
            Maliyet = dto.Maliyet,
            KdvOrani = dto.KdvOrani,
            GarantiSuresiAy = dto.GarantiSuresiAy,
            BozuldugundaBakimTipi = Enum.Parse<BakimTipi>(dto.BozuldugundaBakimTipi),
            StokMiktari = dto.StokMiktari,
            Durum = !string.IsNullOrEmpty(dto.Durum) ? Enum.Parse<UrunDurum>(dto.Durum) : UrunDurum.Pasif
        };

        var created = await _urunRepository.AddAsync(entity);
        
        await _logService.LogAsync(
             "Create", "Urun", created.Id, 
             $"Yeni ürün eklendi: {created.Ad}", 
             CurrentUserId, CurrentUserName, null);

        return await GetByIdAsync(created.Id) ?? MapToDto(created);
    }

    public async Task UpdateAsync(int id, UrunCreateDto dto)
    {
        var entity = await _urunRepository.GetByIdAsync(id);
        if (entity == null) return;
        
        var oldName = entity.Ad;

        entity.Ad = dto.Ad;
        entity.Marka = dto.Marka;
        entity.Model = dto.Model;
        entity.SeriNumarasi = dto.SeriNumarasi;
        entity.Barkod = dto.Barkod;
        entity.KategoriId = dto.KategoriId;
        entity.DepoId = dto.DepoId;
        entity.EkParcaVar = dto.EkParcaVar;
        entity.Birim = Enum.Parse<Birim>(dto.Birim);
        entity.Maliyet = dto.Maliyet;
        entity.KdvOrani = dto.KdvOrani;
        entity.GarantiSuresiAy = dto.GarantiSuresiAy;
        entity.GarantiSuresiAy = dto.GarantiSuresiAy;
        entity.BozuldugundaBakimTipi = Enum.Parse<BakimTipi>(dto.BozuldugundaBakimTipi);
        entity.StokMiktari = dto.StokMiktari;
        if (!string.IsNullOrEmpty(dto.Durum))
        {
            entity.Durum = Enum.Parse<UrunDurum>(dto.Durum);
        }

        await _urunRepository.UpdateAsync(entity);
        
        await _logService.LogAsync(
             "Update", "Urun", entity.Id, 
             $"Ürün güncellendi: {oldName} -> {entity.Ad}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _urunRepository.GetByIdAsync(id);
        if (entity != null)
        {
            await _urunRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "Urun", id, 
                 $"Ürün silindi: {entity.Ad}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }

    private UrunDto MapToDto(Urun u) => new(
        u.Id,
        u.Ad,
        u.Marka,
        u.Model,
        u.SeriNumarasi,
        u.Barkod,
        u.KategoriId,
        u.Kategori?.Ad,
        u.DepoId,
        u.Depo?.Ad,
        u.EkParcaVar,
        u.Birim.ToString(),
        u.Maliyet,
        u.KdvOrani,
        u.GarantiSuresiAy,
        u.BozuldugundaBakimTipi.ToString(),
        u.StokMiktari,
        u.Durum.ToString()
    );
}
