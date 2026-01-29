using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class KategoriService : IKategoriService
{
    private readonly IKategoriRepository _kategoriRepository;

    public KategoriService(IKategoriRepository kategoriRepository)
    {
        _kategoriRepository = kategoriRepository;
    }

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
        return MapToDto(entity);
    }

    public async Task UpdateAsync(int id, KategoriCreateDto dto)
    {
        var entity = await _kategoriRepository.GetByIdAsync(id);
        if (entity == null) return;

        entity.Ad = dto.Ad;
        entity.Aciklama = dto.Aciklama;
        entity.UstKategoriId = dto.UstKategoriId;

        await _kategoriRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(int id)
    {
        await _kategoriRepository.DeleteAsync(id);
    }
}
