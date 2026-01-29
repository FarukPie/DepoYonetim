using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class UrunRepository : EfRepository<Urun>, IUrunRepository
{
    public UrunRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Urun>> GetByDepoIdAsync(int depoId)
    {
        return await _context.Urunler
            .Where(u => u.DepoId == depoId)
            .Include(u => u.Kategori)
            .Include(u => u.Depo)
            .ToListAsync();
    }

    public async Task<IEnumerable<Urun>> SearchAsync(string searchTerm)
    {
        return await _context.Urunler
            .Where(u => u.Ad.Contains(searchTerm) || (u.Barkod != null && u.Barkod.Contains(searchTerm)))
            .Include(u => u.Kategori)
            .Include(u => u.Depo)
            .ToListAsync();
    }

    public async Task<IEnumerable<Urun>> GetBakimdakiUrunlerAsync()
    {
        return await _context.Urunler
            .Where(u => u.Durum == UrunDurum.Bakimda)
            .Include(u => u.Kategori)
            .Include(u => u.Depo)
            .ToListAsync();
    }

    public async Task<IEnumerable<Urun>> GetTamirBekleyenlerAsync()
    {
        return await _context.Urunler
            .Where(u => u.Durum == UrunDurum.TamirBekliyor)
            .Include(u => u.Kategori)
            .Include(u => u.Depo)
            .ToListAsync();
    }
}
