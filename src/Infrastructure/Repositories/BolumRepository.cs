using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Interfaces;
using DepoYonetim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Repositories;

public class BolumRepository : EfRepository<Bolum>, IBolumRepository
{
    public BolumRepository(AppDbContext context) : base(context)
    {
    }
}
