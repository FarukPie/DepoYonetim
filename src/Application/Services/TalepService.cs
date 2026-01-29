using DepoYonetim.Application.DTOs;
using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;

namespace DepoYonetim.Application.Services;

public class TalepService : ITalepService
{
    private readonly IRepository<Talep> _talepRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Urun> _urunRepository;

    public TalepService(IRepository<Talep> talepRepository, IRepository<User> userRepository, IRepository<Urun> urunRepository)
    {
        _talepRepository = talepRepository;
        _userRepository = userRepository;
        _urunRepository = urunRepository;
    }

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
            Detaylar = dto.Detaylar,
            TalepData = dto.TalepData,
            Durum = "Beklemede",
            OlusturmaTarihi = DateTime.Now
        };

        var created = await _talepRepository.AddAsync(talep);

        // Eğer ürünle ilgili bir talepse ürün durumunu güncelle
        if (dto.TalepTipi == "Bakim" || dto.TalepTipi == "Tamir")
        {
             // Basit bir parse işlemi (JSON parse yerine string araması yapıyoruz şimdilik, backend JSON parse için NewtonSoft gerekebilir)
             // İstenirse buraya daha sağlam JSON parsing eklenebilir.
        }

        return MapToDto(created);
    }

    public async Task<TalepDto> OnaylaAsync(int id, int onaylayanUserId)
    {
        var talep = await _talepRepository.GetByIdAsync(id);
        if (talep == null) throw new Exception("Talep bulunamadı");
        if (talep.Durum != "Beklemede") throw new Exception("Talep zaten işlenmiş");

        var approver = await _userRepository.GetByIdAsync(onaylayanUserId);
        if (approver == null) throw new Exception("Onaylayan kullanıcı bulunamadı");

        talep.Durum = "Onaylandi";
        talep.OnaylayanUserId = onaylayanUserId;
        talep.OnaylayanUserName = approver.FullName;
        talep.OnayTarihi = DateTime.Now;

        await _talepRepository.UpdateAsync(talep);
        return MapToDto(talep);
    }

    public async Task<TalepDto> ReddetAsync(int id, int onaylayanUserId, string redNedeni)
    {
        var talep = await _talepRepository.GetByIdAsync(id);
        if (talep == null) throw new Exception("Talep bulunamadı");
        if (talep.Durum != "Beklemede") throw new Exception("Talep zaten işlenmiş");

        var approver = await _userRepository.GetByIdAsync(onaylayanUserId);
        if (approver == null) throw new Exception("Onaylayan kullanıcı bulunamadı");

        talep.Durum = "Reddedildi";
        talep.OnaylayanUserId = onaylayanUserId;
        talep.OnaylayanUserName = approver.FullName;
        talep.OnayTarihi = DateTime.Now;
        talep.RedNedeni = redNedeni;

        await _talepRepository.UpdateAsync(talep);
        return MapToDto(talep);
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
