using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class PersonelRepository : EfRepository<Personel>, IPersonelRepository
{
    public PersonelRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Personel>> GetActivePersonellerAsync()
    {
        return await _context.Personeller
            .Where(p => p.Aktif)
            .ToListAsync();
    }

    public async Task<int> GetZimmetliPersonelSayisiAsync()
    {
        return await _context.Zimmetler
            .Select(z => z.PersonelId)
            .Distinct()
            .CountAsync();
    }
}
