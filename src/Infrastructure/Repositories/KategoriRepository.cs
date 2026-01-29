using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class KategoriRepository : EfRepository<Kategori>, IKategoriRepository
{
    public KategoriRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Kategori>> GetAnaKategorilerAsync()
    {
        return await _context.Kategoriler
            .Where(k => k.UstKategoriId == null)
            .ToListAsync();
    }

    public async Task<IEnumerable<Kategori>> GetAltKategorilerAsync(int ustKategoriId)
    {
        return await _context.Kategoriler
            .Where(k => k.UstKategoriId == ustKategoriId)
            .ToListAsync();
    }
}
