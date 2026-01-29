using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;
using Microsoft.EntityFrameworkCore;

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
        if (await _context.Depolar.AnyAsync() && await _context.Personeller.AnyAsync()) 
        {
            return;
        }

        // 1. Personeller
        var personeller = new List<Personel>();
        if (!await _context.Personeller.AnyAsync())
        {
            for (int i = 1; i <= 10; i++)
            {
                personeller.Add(new Personel
                {
                    Ad = $"Personel{i}",
                    Soyad = $"Soyad{i}",
                    TcNo = $"1234567890{i % 10}",
                    Departman = i % 2 == 0 ? "Depo" : "Lojistik",
                    Unvan = i % 2 == 0 ? "Depo Sorumlusu" : "Lojistik Elemanı",
                    Telefon = $"555123450{i}",
                    Email = $"personel{i}@firma.com",
                    IseGirisTarihi = DateTime.Now.AddMonths(-i),
                    Aktif = true
                });
            }
            await _context.Personeller.AddRangeAsync(personeller);
            await _context.SaveChangesAsync();
        }
        else
        {
            personeller = await _context.Personeller.ToListAsync();
        }

        // 2. Depolar
        var depolar = new List<Depo>();
        if (!await _context.Depolar.AnyAsync())
        {
            for (int i = 1; i <= 10; i++)
            {
                depolar.Add(new Depo
                {
                    Ad = $"Depo {i}",
                    Aciklama = $"Örnek depo {i} açıklaması",
                    SorumluPersonelId = personeller[i % personeller.Count].Id,
                    Aktif = true
                });
            }
            await _context.Depolar.AddRangeAsync(depolar);
            await _context.SaveChangesAsync();
        }
        else
        {
            depolar = await _context.Depolar.ToListAsync();
        }

        // 3. Kategoriler
        var kategoriler = new List<Kategori>();
        if (!await _context.Kategoriler.AnyAsync())
        {
            // Create main categories
            for (int i = 1; i <= 5; i++)
            {
                var mainCat = new Kategori
                {
                    Ad = $"Ana Kategori {i}",
                    Aciklama = $"Ana kategori {i} açıklaması",
                    UstKategoriId = null
                };
                await _context.Kategoriler.AddAsync(mainCat);
                await _context.SaveChangesAsync();
                kategoriler.Add(mainCat);

                // Add subcategory
                var subCat = new Kategori
                {
                    Ad = $"Alt Kategori {i}.1",
                    Aciklama = $"Alt kategori {i}.1 açıklaması",
                    UstKategoriId = mainCat.Id
                };
                await _context.Kategoriler.AddAsync(subCat);
                kategoriler.Add(subCat);
            }
            await _context.SaveChangesAsync();
        }
        else
        {
            kategoriler = await _context.Kategoriler.ToListAsync();
        }

        // 4. Cariler
        var cariler = new List<Cari>();
        if (!await _context.Cariler.AnyAsync())
        {
            for (int i = 1; i <= 10; i++)
            {
                cariler.Add(new Cari
                {
                    FirmaAdi = $"Firma {i} Ltd. Şti.",
                    Tip = i % 2 == 0 ? CariTipi.Tedarikci : CariTipi.Musteri,
                    VergiNo = $"12345678{i}0",
                    VergiDairesi = "Merkez",
                    Adres = $"Adres satırı {i}",
                    Il = "İstanbul",
                    Ilce = "Merkez",
                    Telefon = $"212123450{i}",
                    Email = $"info@firma{i}.com",
                    YetkiliKisi = $"Yetkili {i}",
                    Aktif = true
                });
            }
            await _context.Cariler.AddRangeAsync(cariler);
            await _context.SaveChangesAsync();
        }
        else
        {
            cariler = await _context.Cariler.ToListAsync();
        }

        // 5. Urunler
        var urunler = new List<Urun>();
        if (!await _context.Urunler.AnyAsync())
        {
            var r = new Random();
            for (int i = 1; i <= 10; i++)
            {
                urunler.Add(new Urun
                {
                    Ad = $"Ürün {i} Modeli",
                    Barkod = $"BRK{1000 + i}",
                    KategoriId = kategoriler[i % kategoriler.Count].Id,
                    DepoId = depolar[i % depolar.Count].Id,
                    EkParcaVar = i % 3 == 0,
                    Birim = Birim.Adet,
                    Maliyet = 100 * i,
                    StokMiktari = r.Next(1, 100),
                    Durum = i % 5 == 0 ? UrunDurum.Bakimda : (i % 6 == 0 ? UrunDurum.TamirBekliyor : UrunDurum.Aktif)
                });
            }
            await _context.Urunler.AddRangeAsync(urunler);
            await _context.SaveChangesAsync();
        }
        else
        {
            urunler = await _context.Urunler.ToListAsync();
        }

        // 6. Zimmetler
        if (!await _context.Zimmetler.AnyAsync())
        {
            var zimmetler = new List<Zimmet>();
            for (int i = 1; i <= 10; i++)
            {
                zimmetler.Add(new Zimmet
                {
                    UrunId = urunler[i % urunler.Count].Id,
                    PersonelId = personeller[i % personeller.Count].Id,
                    ZimmetTarihi = DateTime.Now.AddDays(-i),
                    Aciklama = $"Zimmet {i} açıklaması",
                    Durum = ZimmetDurum.Aktif
                });
            }
            await _context.Zimmetler.AddRangeAsync(zimmetler);
            await _context.SaveChangesAsync();
        }

        // 7. Faturalar
        if (!await _context.Faturalar.AnyAsync())
        {
            var faturalar = new List<Fatura>();
            for (int i = 1; i <= 10; i++)
            {
                var fatura = new Fatura
                {
                    FaturaNo = $"FTR{2024000 + i}",
                    CariId = cariler[i % cariler.Count].Id,
                    FaturaTarihi = DateTime.Now.AddDays(-i * 2),
                    Aciklama = $"Fatura {i} açıklaması"
                };

                // Add Items to calculate totals
                var kalemler = new List<FaturaKalemi>
                {
                    new FaturaKalemi
                    {
                        UrunId = urunler[i % urunler.Count].Id,
                        Miktar = 2,
                        BirimFiyat = 50 * i,
                        KdvOrani = 18,
                        IndirimOrani = 0,
                        Toplam = 2 * (50 * i) * 1.18m
                    }
                };

                fatura.Kalemler = kalemler;
                fatura.AraToplam = 2 * (50 * i);
                fatura.ToplamKdv = fatura.AraToplam * 0.18m;
                fatura.GenelToplam = fatura.AraToplam + fatura.ToplamKdv;

                faturalar.Add(fatura);
            }
            await _context.Faturalar.AddRangeAsync(faturalar);
            await _context.SaveChangesAsync();
        }

        // 8. Talepler
         if (!await _context.Talepler.AnyAsync())
        {
            var talepler = new List<Talep>();
            for (int i = 1; i <= 10; i++)
            {
                talepler.Add(new Talep
                {
                   TalepTipi = "CariEkleme",
                   TalepEdenUserId = 1, // Assume Admin ID 1
                   TalepEdenUserName = "admin",
                   Baslik = $"Talep {i}",
                   Detaylar = $"Talep {i} detay açıklaması",
                   Durum = "Beklemede",
                   OlusturmaTarihi = DateTime.Now.AddHours(-i)
                });
            }
            await _context.Talepler.AddRangeAsync(talepler);
            await _context.SaveChangesAsync();
        }
    }
}
