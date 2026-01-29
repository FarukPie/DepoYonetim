using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class UrunService : IUrunService
{
    private readonly IUrunRepository _urunRepository;

    public UrunService(IUrunRepository urunRepository)
    {
        _urunRepository = urunRepository;
    }

    private UrunDto MapToDto(Urun u)
    {
        return new UrunDto(
            u.Id,
            u.Ad,
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
        var u = await _urunRepository.GetByIdAsync(id);
        return u == null ? null : MapToDto(u);
    }

    public async Task<UrunDto> CreateAsync(UrunCreateDto dto)
    {
        var entity = new Urun
        {
            Ad = dto.Ad,
            KategoriId = dto.KategoriId,
            DepoId = dto.DepoId,
            EkParcaVar = dto.EkParcaVar,
            Birim = Enum.Parse<Birim>(dto.Birim),
            Maliyet = dto.Maliyet,
            KdvOrani = dto.KdvOrani,
            GarantiSuresiAy = dto.GarantiSuresiAy,
            BozuldugundaBakimTipi = Enum.Parse<BakimTipi>(dto.BozuldugundaBakimTipi),
            StokMiktari = dto.StokMiktari,
            Durum = UrunDurum.Aktif
        };

        await _urunRepository.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task UpdateAsync(int id, UrunCreateDto dto)
    {
        var entity = await _urunRepository.GetByIdAsync(id);
        if (entity == null) return;

        entity.Ad = dto.Ad;
        entity.KategoriId = dto.KategoriId;
        entity.DepoId = dto.DepoId;
        entity.EkParcaVar = dto.EkParcaVar;
        entity.Birim = Enum.Parse<Birim>(dto.Birim);
        entity.Maliyet = dto.Maliyet;
        entity.KdvOrani = dto.KdvOrani;
        entity.GarantiSuresiAy = dto.GarantiSuresiAy;
        entity.BozuldugundaBakimTipi = Enum.Parse<BakimTipi>(dto.BozuldugundaBakimTipi);
        entity.StokMiktari = dto.StokMiktari;

        await _urunRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(int id)
    {
        await _urunRepository.DeleteAsync(id);
    }
}
