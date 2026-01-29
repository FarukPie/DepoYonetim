using DepoYonetim.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DepoYonetim.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Depo> Depolar { get; set; }
    public DbSet<Urun> Urunler { get; set; }
    public DbSet<Kategori> Kategoriler { get; set; }
    public DbSet<Personel> Personeller { get; set; }
    public DbSet<Cari> Cariler { get; set; }
    public DbSet<Fatura> Faturalar { get; set; }
    public DbSet<Zimmet> Zimmetler { get; set; }
    public DbSet<Talep> Talepler { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<SystemLog> SystemLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Ensure relationships are correctly configured if needed
        // For now, adhering to conventions
    }
}
