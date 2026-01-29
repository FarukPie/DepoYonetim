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
