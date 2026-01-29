using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class CariRepository : EfRepository<Cari>, ICariRepository
{
    public CariRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Cari>> SearchAsync(string searchTerm)
    {
        return await _context.Cariler
            .Where(c => c.FirmaAdi.Contains(searchTerm) || (c.VergiNo != null && c.VergiNo.Contains(searchTerm)))
            .ToListAsync();
    }
}
