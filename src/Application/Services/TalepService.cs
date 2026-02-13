using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Core.Enums;
using System.Text.Json;


namespace DepoYonetim.Application.Services;

public class TalepService : ITalepService
{
    private readonly IRepository<Talep> _talepRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IMalzemeKalemiRepository _malzemeRepository;
    private readonly ISystemLogService _logService;
    private readonly ICurrentUserService _currentUserService;

    public TalepService(
        IRepository<Talep> talepRepository,
        IRepository<User> userRepository,
        IMalzemeKalemiRepository malzemeRepository,
        ISystemLogService logService,
        ICurrentUserService currentUserService)
    {
        _talepRepository = talepRepository;
        _userRepository = userRepository;
        _malzemeRepository = malzemeRepository;
        _logService = logService;
        _currentUserService = currentUserService;
    }

    private int? CurrentUserId => _currentUserService.UserId;
    private string CurrentUserName => _currentUserService.UserName;

    public async Task<IEnumerable<TalepDto>> GetAllAsync(string? durum = null)
    {
        var talepler = await _talepRepository.GetAllAsync();
        
        if (!string.IsNullOrEmpty(durum))
        {
            talepler = talepler.Where(t => t.Durum == durum);
        }

        return talepler
            .OrderByDescending(t => t.OlusturmaTarihi)
            .Select(MapToDto);
    }

    public async Task<IEnumerable<TalepDto>> GetByUserIdAsync(int userId)
    {
        var talepler = await _talepRepository.FindAsync(t => t.TalepEdenUserId == userId);
        return talepler
            .OrderByDescending(t => t.OlusturmaTarihi)
            .Select(MapToDto);
    }

    public async Task<TalepDto?> GetByIdAsync(int id)
    {
        var talep = await _talepRepository.GetByIdAsync(id);
        return talep != null ? MapToDto(talep) : null;
    }

    public async Task<TalepDto> CreateAsync(CreateTalepDto dto)
    {
        var user = await _userRepository.GetByIdAsync(dto.TalepEdenUserId);
        if (user == null) throw new Exception("Kullanıcı bulunamadı");

        var talep = new Talep
        {
            TalepTipi = dto.TalepTipi,
            TalepEdenUserId = dto.TalepEdenUserId,
            TalepEdenUserName = user.FullName,
            Baslik = dto.Baslik,
            Detaylar = dto.Detaylar ?? string.Empty,
            TalepData = dto.TalepData ?? "{}",
            Durum = "Beklemede",
            OlusturmaTarihi = DateTime.Now
        };

        var created = await _talepRepository.AddAsync(talep);

        await _logService.LogAsync(
             "Create", "Talep", created.Id, 
             $"Yeni talep oluşturuldu: {created.Baslik}", 
             CurrentUserId, CurrentUserName, null);

        // Not: Malzeme durumu güncelleme on onay aşamasında yapılır.

        return MapToDto(created);
    }

    public async Task<TalepDto> OnaylaAsync(int id, int onaylayanUserId)
    {
        var talep = await _talepRepository.GetByIdAsync(id);
        if (talep == null) throw new Exception("Talep bulunamadı");
        if (talep.Durum != "Beklemede") throw new Exception("Talep zaten işlenmiş");

        var approver = await _userRepository.GetByIdAsync(onaylayanUserId);
        if (approver == null) 
        {
             var users = await _userRepository.GetAllAsync();
             approver = users.FirstOrDefault();
        }
        if (approver == null) throw new Exception("Onaylayan kullanıcı bulunamadı");

        // Malzeme durumu güncelleme
        if (talep.TalepTipi == "Bakim" || talep.TalepTipi == "Tamir")
        {
            try 
            {
                var talepData = JsonSerializer.Deserialize<JsonElement>(talep.TalepData);
                int malzemeId = 0;

                // Support both urunId (legacy/frontend) and malzemeKalemiId
                if (talepData.TryGetProperty("malzemeKalemiId", out var idProp))
                {
                    malzemeId = idProp.GetInt32();
                } 
                else if (talepData.TryGetProperty("urunId", out var idPropClassic))
                {
                    malzemeId = idPropClassic.GetInt32();
                }

                if (malzemeId > 0)
                {
                    var malzeme = await _malzemeRepository.GetByIdAsync(malzemeId);
                    if (malzeme != null)
                    {
                        if (talep.TalepTipi == "Tamir")
                        {
                            malzeme.State = (int)UrunDurum.TamirBekliyor;
                        }
                        else if (talep.TalepTipi == "Bakim")
                        {
                            malzeme.State = (int)UrunDurum.Bakimda;
                        }
                        await _malzemeRepository.UpdateAsync(malzeme);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Malzeme durum güncelleme hatası: {ex.Message}");
            }
        }

        talep.Durum = "Onaylandi";
        talep.OnaylayanUserId = approver.Id;
        talep.OnaylayanUserName = approver.FullName;
        talep.OnayTarihi = DateTime.Now;

        await _talepRepository.UpdateAsync(talep);
        
        await _logService.LogAsync(
             "Approve", "Talep", talep.Id, 
             $"Talep onaylandı: {talep.Baslik}", 
             CurrentUserId, CurrentUserName, null);

        return MapToDto(talep);
    }

    public async Task<TalepDto> ReddetAsync(int id, int onaylayanUserId, string redNedeni)
    {
        var talep = await _talepRepository.GetByIdAsync(id);
        if (talep == null) throw new Exception("Talep bulunamadı");
        if (talep.Durum != "Beklemede") throw new Exception("Talep zaten işlenmiş");

        var approver = await _userRepository.GetByIdAsync(onaylayanUserId);
        if (approver == null) 
        {
             var users = await _userRepository.GetAllAsync();
             approver = users.FirstOrDefault();
        }
        if (approver == null) throw new Exception("Onaylayan kullanıcı bulunamadı");

        talep.Durum = "Reddedildi";
        talep.OnaylayanUserId = approver.Id;
        talep.OnaylayanUserName = approver.FullName;
        talep.OnayTarihi = DateTime.Now;
        talep.RedNedeni = redNedeni;

        await _talepRepository.UpdateAsync(talep);
        
        await _logService.LogAsync(
             "Reject", "Talep", talep.Id, 
             $"Talep reddedildi: {talep.Baslik}. Neden: {redNedeni}", 
             CurrentUserId, CurrentUserName, null);

        return MapToDto(talep);
    }
    
    public async Task DeleteAsync(int id)
    {
        var talep = await _talepRepository.GetByIdAsync(id);
        if (talep != null)
        {
            await _talepRepository.DeleteAsync(id);
            
            await _logService.LogAsync(
                 "Delete", "Talep", id, 
                 $"Talep silindi: {talep.Baslik}", 
                 CurrentUserId, CurrentUserName, null);
        }
    }

    public async Task<int> GetBekleyenSayisiAsync()
    {
        var talepler = await _talepRepository.FindAsync(t => t.Durum == "Beklemede");
        return talepler.Count();
    }

    private static TalepDto MapToDto(Talep t)
    {
        return new TalepDto(
            t.Id,
            t.TalepTipi ?? string.Empty,
            t.TalepEdenUserId,
            t.TalepEdenUserName ?? string.Empty,
            t.Baslik ?? string.Empty,
            t.Detaylar ?? string.Empty,
            t.TalepData ?? string.Empty,
            t.Durum ?? string.Empty,
            t.OnaylayanUserId,
            t.OnaylayanUserName,
            t.OnayTarihi,
            t.RedNedeni,
            t.OlusturmaTarihi
        );
    }
}
