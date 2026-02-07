using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;



namespace DepoYonetim.Application.Services;

public class CariService : ICariService
{
    private readonly ICariRepository _cariRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public CariService(
        ICariRepository cariRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _cariRepository = cariRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }

    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    private CariDto MapToDto(Cari c)
    {
        return new CariDto(
            c.Id,
            c.FirmaAdi,
            c.Tip.ToString(),
            c.TicaretSicilNo,
            c.VergiNo,
            c.VergiDairesi,
            c.Adres,
            c.Il,
            c.Ilce,
            c.Telefon,
            c.Fax,
            c.Email,
            c.WebSitesi,
            c.YetkiliKisi,
            c.YetkiliTelefon,
            c.BankaAdi,
            c.IbanNo,
            true // Assuming Active
        );
    }

    public async Task<IEnumerable<CariDto>> GetAllAsync()
    {
        var list = await _cariRepository.GetAllAsync();
        return list.Select(MapToDto);
    }

    public async Task<IEnumerable<CariDto>> SearchAsync(string searchTerm)
    {
        var list = await _cariRepository.SearchAsync(searchTerm);
        return list.Select(MapToDto);
    }

    public async Task<CariDto?> GetByIdAsync(int id)
    {
        var c = await _cariRepository.GetByIdAsync(id);
        return c == null ? null : MapToDto(c);
    }

    public async Task<CariDto> CreateAsync(CariCreateDto dto)
    {
        var entity = new Cari
        {
            FirmaAdi = dto.FirmaAdi,
            Tip = Enum.Parse<CariTipi>(dto.Tip),
            TicaretSicilNo = dto.TicaretSicilNo,
            VergiNo = dto.VergiNo,
            VergiDairesi = dto.VergiDairesi,
            Adres = dto.Adres,
            Il = dto.Il,
            Ilce = dto.Ilce,
            Telefon = dto.Telefon,
            Fax = dto.Fax,
            Email = dto.Email,
            WebSitesi = dto.WebSitesi,
            YetkiliKisi = dto.YetkiliKisi,
            YetkiliTelefon = dto.YetkiliTelefon,
            BankaAdi = dto.BankaAdi,
            IbanNo = dto.IbanNo
        };

        await _cariRepository.AddAsync(entity);
        
        await _logService.LogAsync(
            "Create", "Cari", entity.Id, 
            $"Yeni cari eklendi: {entity.FirmaAdi}", 
            CurrentUserId, CurrentUserName, null);

        return MapToDto(entity);
    }

    public async Task UpdateAsync(int id, CariCreateDto dto)
    {
        var entity = await _cariRepository.GetByIdAsync(id);
        if (entity == null) return;

        var oldName = entity.FirmaAdi;

        entity.FirmaAdi = dto.FirmaAdi;
        entity.Tip = Enum.Parse<CariTipi>(dto.Tip);
        entity.TicaretSicilNo = dto.TicaretSicilNo;
        entity.VergiNo = dto.VergiNo;
        entity.VergiDairesi = dto.VergiDairesi;
        entity.Adres = dto.Adres;
        entity.Il = dto.Il;
        entity.Ilce = dto.Ilce;
        entity.Telefon = dto.Telefon;
        entity.Fax = dto.Fax;
        entity.Email = dto.Email;
        entity.WebSitesi = dto.WebSitesi;
        entity.YetkiliKisi = dto.YetkiliKisi;
        entity.YetkiliTelefon = dto.YetkiliTelefon;
        entity.BankaAdi = dto.BankaAdi;
        entity.IbanNo = dto.IbanNo;

        await _cariRepository.UpdateAsync(entity);

        await _logService.LogAsync(
            "Update", "Cari", entity.Id, 
            $"Cari güncellendi: {oldName} -> {entity.FirmaAdi}", 
            CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _cariRepository.GetByIdAsync(id);
        if (entity != null)
        {
            await _cariRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                "Delete", "Cari", id, 
                $"Cari silindi: {entity.FirmaAdi}", 
                CurrentUserId, CurrentUserName, null);
        }
    }
}
