using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class MalzemeKalemiRepository : EfRepository<MalzemeKalemi>, IMalzemeKalemiRepository
{
    public MalzemeKalemiRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<MalzemeKalemi>> SearchAsync(string searchTerm)
    {
        return await _context.MalzemeKalemleri
            .Where(u => u.Ad.Contains(searchTerm) || (u.DmbNo != null && u.DmbNo.Contains(searchTerm)))
            .ToListAsync();
    }

    public async Task<IEnumerable<MalzemeKalemi>> GetBakimdakiMalzemelerAsync()
    {
        // Assuming 'State' uses the same integer values as UrunDurum.Bakimda
        var bakimdaState = (int)UrunDurum.Bakimda;
        return await _context.MalzemeKalemleri
            .Where(u => u.State == bakimdaState)
            .ToListAsync();
    }

    public async Task<IEnumerable<MalzemeKalemi>> GetTamirBekleyenlerAsync()
    {
        // Assuming 'State' uses the same integer values as UrunDurum.TamirBekliyor
        var tamirState = (int)UrunDurum.TamirBekliyor;
        return await _context.MalzemeKalemleri
            .Where(u => u.State == tamirState)
            .ToListAsync();
    }
}
