using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class ZimmetService : IZimmetService
{
    private readonly IZimmetRepository _zimmetRepository;

    public ZimmetService(IZimmetRepository zimmetRepository)
    {
        _zimmetRepository = zimmetRepository;
    }

    private ZimmetDto MapToDto(Zimmet z)
    {
        return new ZimmetDto(
            z.Id,
            z.UrunId,
            z.Urun?.Ad ?? "",
            z.PersonelId,
            z.Personel != null ? $"{z.Personel.Ad} {z.Personel.Soyad}" : "",
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
        var entity = new Zimmet
        {
            UrunId = dto.UrunId,
            PersonelId = dto.PersonelId,
            ZimmetTarihi = dto.ZimmetTarihi,
            Aciklama = dto.Aciklama,
            Durum = ZimmetDurum.Aktif
        };

        await _zimmetRepository.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task IadeEtAsync(int id)
    {
        var z = await _zimmetRepository.GetByIdAsync(id);
        if (z == null) return;

        z.Durum = ZimmetDurum.Iade;
        z.IadeTarihi = DateTime.Now;

        await _zimmetRepository.UpdateAsync(z);
    }
}
