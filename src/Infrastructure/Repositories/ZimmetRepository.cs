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

    public override async Task<IEnumerable<Zimmet>> GetAllAsync()
    {
        return await _context.Zimmetler
            .Include(z => z.Urun)
            .Include(z => z.Personel)
            .Include(z => z.Bolum)
            .OrderByDescending(z => z.CreatedAt)
            .ToListAsync();
    }

    public override async Task<Zimmet?> GetByIdAsync(int id)
    {
        return await _context.Zimmetler
            .Include(z => z.Urun)
            .Include(z => z.Personel)
            .Include(z => z.Bolum)
            .FirstOrDefaultAsync(z => z.Id == id);
    }

    public async Task<IEnumerable<Zimmet>> GetSonZimmetlerAsync(int count)
    {
        return await _context.Zimmetler
            .OrderByDescending(z => z.ZimmetTarihi)
            .Take(count)
            .Include(z => z.Urun)
            .Include(z => z.Personel)
            .Include(z => z.Bolum)
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
