using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;


namespace DepoYonetim.Application.Services;

public class PersonelService : IPersonelService
{
    private readonly IPersonelRepository _personelRepository;
    private readonly IZimmetRepository _zimmetRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public PersonelService(
        IPersonelRepository personelRepository,
        IZimmetRepository zimmetRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _personelRepository = personelRepository;
        _zimmetRepository = zimmetRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }
    
    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

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

    public async Task<PagedResultDto<PersonelDto>> GetPagedAsync(PaginationRequest request)
    {
        System.Linq.Expressions.Expression<Func<Personel, bool>>? predicate = null;
        
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            predicate = x => x.Ad.Contains(request.SearchTerm) || 
                             x.Soyad.Contains(request.SearchTerm) ||
                             (x.TcNo != null && x.TcNo.Contains(request.SearchTerm)) ||
                             (x.Departman != null && x.Departman.Contains(request.SearchTerm));
        }

        var pagedResult = await _personelRepository.GetPagedAsync(
            request.PageNumber,
            request.PageSize,
            predicate,
            q => q.OrderByDescending(x => x.Id) // Id or Ad
        );

        var dtos = pagedResult.Items.Select(MapToDto);
        
        return new PagedResultDto<PersonelDto>(
            dtos, 
            pagedResult.TotalCount, 
            pagedResult.PageNumber, 
            pagedResult.PageSize
        );
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
        
        await _logService.LogAsync(
             "Create", "Personel", entity.Id, 
             $"Yeni personel eklendi: {entity.Ad} {entity.Soyad}", 
             CurrentUserId, CurrentUserName, null);
        
        return MapToDto(entity);
    }

    public async Task UpdateAsync(int id, PersonelCreateDto dto)
    {
        var entity = await _personelRepository.GetByIdAsync(id);
        if (entity == null) return;
        
        var oldName = $"{entity.Ad} {entity.Soyad}";

        entity.Ad = dto.Ad;
        entity.Soyad = dto.Soyad;
        entity.TcNo = dto.TcNo;
        entity.Departman = dto.Departman;
        entity.Unvan = dto.Unvan;
        entity.Telefon = dto.Telefon;
        entity.Email = dto.Email;
        if (dto.IseGirisTarihi.HasValue) entity.IseGirisTarihi = dto.IseGirisTarihi.Value;

        await _personelRepository.UpdateAsync(entity);
        
        await _logService.LogAsync(
             "Update", "Personel", entity.Id, 
             $"Personel güncellendi: {oldName} -> {entity.Ad} {entity.Soyad}", 
             CurrentUserId, CurrentUserName, null);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _personelRepository.GetByIdAsync(id);
        if (entity != null)
        {
            var zimmetler = await _zimmetRepository.GetByPersonelIdAsync(id);
            if (zimmetler.Any())
            {
                 throw new DepoYonetim.Core.Exceptions.BusinessException($"Bu personele ait {zimmetler.Count()} adet aktif zimmet bulunmaktadır. Personel silinemez.");
            }

            await _personelRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "Personel", id, 
                 $"Personel silindi: {entity.Ad} {entity.Soyad}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }
}
