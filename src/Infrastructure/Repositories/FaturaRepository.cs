using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class FaturaRepository : EfRepository<Fatura>, IFaturaRepository
{
    public FaturaRepository(AppDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Fatura>> GetAllAsync()
    {
        return await _context.Faturalar
            .Include(f => f.Cari)
            .Include(f => f.Kalemler)
                .ThenInclude(k => k.MalzemeKalemi)
            .ToListAsync();
    }

    public override async Task<Fatura?> GetByIdAsync(int id)
    {
        return await _context.Faturalar
            .Include(f => f.Cari)
            .Include(f => f.Kalemler)
                .ThenInclude(k => k.MalzemeKalemi)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<IEnumerable<Fatura>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _context.Faturalar
            .Where(f => f.FaturaTarihi >= startDate && f.FaturaTarihi <= endDate)
            .Include(f => f.Cari)
            .ToListAsync();
    }

    public async Task<IEnumerable<Fatura>> GetByCariIdAsync(int cariId)
    {
        return await _context.Faturalar
            .Where(f => f.CariId == cariId)
            .Include(f => f.Cari)
            .ToListAsync();
    }
}
