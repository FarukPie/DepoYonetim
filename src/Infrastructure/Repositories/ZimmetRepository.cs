using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class ZimmetRepository : EfRepository<Zimmet>, IZimmetRepository
{
    public ZimmetRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Zimmet>> GetSonZimmetlerAsync(int count)
    {
        return await _context.Zimmetler
            .OrderByDescending(z => z.ZimmetTarihi)
            .Take(count)
            .Include(z => z.Urun)
            .Include(z => z.Personel)
            .ToListAsync();
    }

    public async Task<IEnumerable<Zimmet>> GetByPersonelIdAsync(int personelId)
    {
        return await _context.Zimmetler
            .Where(z => z.PersonelId == personelId)
            .Include(z => z.Urun)
            .ToListAsync();
    }
}
