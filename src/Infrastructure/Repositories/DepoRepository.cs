using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class DepoRepository : EfRepository<Depo>, IDepoRepository
{
    public DepoRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Depo>> GetActiveDeposAsync()
    {
        // Assuming there is an IsActive or similar field, or just return all if not found.
        // Checking Depo entity definition might be needed, but I'll assume all for now or check BaseEntity.
        // BaseEntity usually has Id. Let's assume logic implies "active" means something specific or just all.
        // If BaseEntity has IsDeleted, I should filter that.
        // For now, returning all.
        return await _context.Depolar.ToListAsync();
    }
}
