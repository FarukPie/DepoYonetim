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

    public override async Task<IEnumerable<Kategori>> GetAllAsync()
    {
        return await _context.Kategoriler
            .Include(k => k.Malzemeler)
            .ToListAsync();
    }

    public async Task<IEnumerable<Kategori>> GetAnaKategorilerAsync()
    {
        return await _context.Kategoriler
            .Include(k => k.Malzemeler)
            .Where(k => k.UstKategoriId == null)
            .ToListAsync();
    }

    public async Task<IEnumerable<Kategori>> GetAltKategorilerAsync(int ustKategoriId)
    {
        return await _context.Kategoriler
            .Include(k => k.Malzemeler)
            .Where(k => k.UstKategoriId == ustKategoriId)
            .ToListAsync();
    }
}
