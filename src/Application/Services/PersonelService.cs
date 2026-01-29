using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class PersonelService : IPersonelService
{
    private readonly IPersonelRepository _personelRepository;

    public PersonelService(IPersonelRepository personelRepository)
    {
        _personelRepository = personelRepository;
    }

    private PersonelDto MapToDto(Personel p)
    {
        return new PersonelDto(
            p.Id,
            p.Ad,
            p.Soyad,
            $"{p.Ad} {p.Soyad}",
            p.TcNo,
            p.Departman,
            p.Unvan,
            p.Telefon,
            p.Email,
            p.IseGirisTarihi,
            p.Aktif,
            p.Zimmetler.Count
        );
    }

    public async Task<IEnumerable<PersonelDto>> GetAllAsync()
    {
        var list = await _personelRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<PersonelDto>> SearchAsync(string searchTerm)
    {
        var list = await _personelRepository.GetAllAsync(); 
        return list.Where(p => p.Ad.Contains(searchTerm) || p.Soyad.Contains(searchTerm))
                   .Select(MapToDto);
    }

    public async Task<PersonelDto?> GetByIdAsync(int id)
    {
        var p = await _personelRepository.GetByIdAsync(id);
        return p == null ? null : MapToDto(p);
    }

    public async Task<PersonelDto> CreateAsync(PersonelCreateDto dto)
    {
        var entity = new Personel
        {
            Ad = dto.Ad,
            Soyad = dto.Soyad,
            TcNo = dto.TcNo,
            Departman = dto.Departman,
            Unvan = dto.Unvan,
            Telefon = dto.Telefon,
            Email = dto.Email,
            IseGirisTarihi = dto.IseGirisTarihi ?? DateTime.Now,
            Aktif = true
        };

        await _personelRepository.AddAsync(entity);
        return MapToDto(entity);
    }

    public async Task UpdateAsync(int id, PersonelCreateDto dto)
    {
        var entity = await _personelRepository.GetByIdAsync(id);
        if (entity == null) return;

        entity.Ad = dto.Ad;
        entity.Soyad = dto.Soyad;
        entity.TcNo = dto.TcNo;
        entity.Departman = dto.Departman;
        entity.Unvan = dto.Unvan;
        entity.Telefon = dto.Telefon;
        entity.Email = dto.Email;
        if (dto.IseGirisTarihi.HasValue) entity.IseGirisTarihi = dto.IseGirisTarihi.Value;

        await _personelRepository.UpdateAsync(entity);
    }

    public async Task DeleteAsync(int id)
    {
        await _personelRepository.DeleteAsync(id);
    }
}
