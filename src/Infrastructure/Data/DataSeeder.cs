using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace DepoYonetim.Infrastructure.Data;

public class DataSeeder
{
    private readonly AppDbContext _context;

    public DataSeeder(AppDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Don't seed if data exists
        if (await _context.Personeller.AnyAsync() && await _context.Users.AnyAsync()) 
        {
            return;
        }

        // 0.1 Roles
        var roles = new List<Role>();
        if (!await _context.Roles.AnyAsync())
        {
            // Admin Role
            roles.Add(new Role
            {
                Name = "Admin",
                Description = "Sistem yöneticisi - Tüm yetkilere sahip",
                PagePermissions = JsonSerializer.Serialize(new[] { "dashboard", "depolar", "malzemekalemleri", "faturalar", "cariler", "kategoriler", "personeller", "zimmetler", "kullanicilar", "roller", "talepler", "loglar" }),
                EntityPermissions = JsonSerializer.Serialize(new Dictionary<string, string[]> 
                { 
                    { "cari", new[] { "add", "edit", "delete" } },
                    { "depo", new[] { "add", "edit", "delete" } },
                    { "kategori", new[] { "add", "edit", "delete" } },
                    { "kullanici", new[] { "add", "edit", "delete" } }
                })
            });

            // Kullanici Role
            roles.Add(new Role
            {
                Name = "Kullanici",
                Description = "Standart kullanıcı - Sadece görüntüleme ve talep oluşturma",
                PagePermissions = JsonSerializer.Serialize(new[] { "dashboard", "depolar", "urunler", "kategoriler", "zimmetler", "talep-olustur" }),
                EntityPermissions = "{}"
            });

            await _context.Roles.AddRangeAsync(roles);
            await _context.SaveChangesAsync();
        }
        else
        {
            roles = await _context.Roles.ToListAsync();
        }

        // 0.2 Users
        var users = new List<User>();
        if (!await _context.Users.AnyAsync())
        {
            // Admin User (ID 1)
            users.Add(new User
            {
                Username = "admin",
                Email = "admin@canhastanesi.com",
                FullName = "Sistem Yöneticisi",
                Password = "admin123", // In a real app, hash this!
                RoleId = roles.First(r => r.Name == "Admin").Id,
                IsActive = true
            });

            // Demo User (ID 2)
            users.Add(new User
            {
                Username = "user",
                Email = "user@canhastanesi.com",
                FullName = "Demo Kullanıcı",
                Password = "user123",
                RoleId = roles.First(r => r.Name == "Kullanici").Id,
                IsActive = true
            });

            // Ahmet Yılmaz (ID 3)
            users.Add(new User
            {
                Username = "ahmet.yilmaz",
                Email = "ahmet.yilmaz@canhastanesi.com",
                FullName = "Ahmet Yılmaz",
                Password = "ahmet123",
                RoleId = roles.First(r => r.Name == "Kullanici").Id,
                IsActive = true
            });

            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();
        }
        else
        {
            users = await _context.Users.ToListAsync();
        }

        // 1. Personeller
        /*
        var personeller = new List<Personel>();
        if (!await _context.Personeller.AnyAsync())
        {
            // ... Sample data seeding removed ...
        }
        */

        // 2. Depolar
        /*
        var depolar = new List<Depo>();
        if (!await _context.Depolar.AnyAsync())
        {
            // ... Sample data seeding removed ...
        }
        */

        // 3. Kategoriler
        /*
        var kategoriler = new List<Kategori>();
        if (!await _context.Kategoriler.AnyAsync())
        {
            // ... Sample data seeding removed ...
        }
        */

        // 4. Cariler
        /*
        var cariler = new List<Cari>();
        if (!await _context.Cariler.AnyAsync())
        {
             // ... Sample data seeding removed ...
        }
        */

        // 5. Urunler
        /*
        var urunler = new List<Urun>();
        if (!await _context.Urunler.AnyAsync())
        {
             // ... Sample data seeding removed ...
        }
        */

        // 6. Zimmetler
        /*
        if (!await _context.Zimmetler.AnyAsync())
        {
             // ... Sample data seeding removed ...
        }
        */

        // 7. Faturalar
        /*
        if (!await _context.Faturalar.AnyAsync())
        {
             // ... Sample data seeding removed ...
        }
        */

        // 8. Talepler
        /*
         if (!await _context.Talepler.AnyAsync())
        {
             // ... Sample data seeding removed ...
        }
        */
    }
}
