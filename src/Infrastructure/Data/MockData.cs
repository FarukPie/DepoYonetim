using DepoYonetim.Core.Entities;
using DepoYonetim.Core.Enums;

namespace DepoYonetim.Infrastructure.Data;

/// <summary>
/// Static mock data for testing purposes.
/// This will be replaced with actual database context when MySQL is connected.
/// </summary>
public static class MockData
{
    public static List<Personel> Personeller { get; } = new()
    {
        new() { Id = 1, Ad = "Ahmet", Soyad = "Yılmaz", TcNo = "12345678901", Departman = "Bilgi İşlem", Unvan = "Sistem Yöneticisi", Telefon = "0532 111 2233", Email = "ahmet.yilmaz@canhastaesi.com", IseGirisTarihi = new DateTime(2020, 3, 15), Aktif = true },
        new() { Id = 2, Ad = "Fatma", Soyad = "Demir", TcNo = "23456789012", Departman = "Muhasebe", Unvan = "Muhasebe Uzmanı", Telefon = "0533 222 3344", Email = "fatma.demir@canhastanesi.com", IseGirisTarihi = new DateTime(2019, 7, 1), Aktif = true },
        new() { Id = 3, Ad = "Mehmet", Soyad = "Kaya", TcNo = "34567890123", Departman = "Teknik Servis", Unvan = "Biyomedikal Tekniker", Telefon = "0534 333 4455", Email = "mehmet.kaya@canhastanesi.com", IseGirisTarihi = new DateTime(2021, 1, 10), Aktif = true },
        new() { Id = 4, Ad = "Ayşe", Soyad = "Çelik", TcNo = "45678901234", Departman = "Satın Alma", Unvan = "Satın Alma Sorumlusu", Telefon = "0535 444 5566", Email = "ayse.celik@canhastanesi.com", IseGirisTarihi = new DateTime(2018, 9, 20), Aktif = true },
        new() { Id = 5, Ad = "Can", Soyad = "Öztürk", TcNo = "56789012345", Departman = "Yönetim", Unvan = "Depo Müdürü", Telefon = "0536 555 6677", Email = "can.ozturk@canhastanesi.com", IseGirisTarihi = new DateTime(2017, 4, 5), Aktif = true },
        new() { Id = 6, Ad = "Zeynep", Soyad = "Arslan", TcNo = "67890123456", Departman = "Laboratuvar", Unvan = "Laborant", Telefon = "0537 666 7788", Email = "zeynep.arslan@canhastanesi.com", IseGirisTarihi = new DateTime(2022, 2, 14), Aktif = true },
    };

    public static List<Kategori> Kategoriler { get; } = new()
    {
        // Ana Kategoriler
        new() { Id = 1, Ad = "Tıbbi Cihazlar", Aciklama = "Tüm tıbbi cihaz ve ekipmanlar", UstKategoriId = null },
        new() { Id = 2, Ad = "Ofis Ekipmanları", Aciklama = "Bilgisayar, yazıcı vb.", UstKategoriId = null },
        new() { Id = 3, Ad = "Mobilya", Aciklama = "Masa, sandalye, dolap vb.", UstKategoriId = null },
        new() { Id = 4, Ad = "Laboratuvar Ekipmanları", Aciklama = "Laboratuvar cihazları", UstKategoriId = null },
        // Alt Kategoriler - Tıbbi Cihazlar
        new() { Id = 5, Ad = "Görüntüleme Cihazları", Aciklama = "MR, BT, Röntgen", UstKategoriId = 1 },
        new() { Id = 6, Ad = "Hasta Monitörleri", Aciklama = "Vital bulgu takip cihazları", UstKategoriId = 1 },
        new() { Id = 7, Ad = "Solunum Cihazları", Aciklama = "Ventilatör, oksijen konsantratörü", UstKategoriId = 1 },
        // Alt Kategoriler - Ofis Ekipmanları
        new() { Id = 8, Ad = "Bilgisayarlar", Aciklama = "Masaüstü ve dizüstü bilgisayarlar", UstKategoriId = 2 },
        new() { Id = 9, Ad = "Yazıcılar", Aciklama = "Yazıcı ve tarayıcılar", UstKategoriId = 2 },
        // Alt Kategoriler - Laboratuvar
        new() { Id = 10, Ad = "Analiz Cihazları", Aciklama = "Biyokimya, hematoloji analizörleri", UstKategoriId = 4 },
    };

    public static List<Depo> Depolar { get; } = new()
    {
        new() { Id = 1, Ad = "Ana Depo", Aciklama = "Hastane ana deposu - Zemin kat", SorumluPersonelId = 5, Aktif = true },
        new() { Id = 2, Ad = "Tıbbi Cihaz Deposu", Aciklama = "Tıbbi cihaz ve ekipmanlar deposu", SorumluPersonelId = 3, Aktif = true },
        new() { Id = 3, Ad = "BT Deposu", Aciklama = "Bilgi teknolojileri ekipmanları", SorumluPersonelId = 1, Aktif = true },
        new() { Id = 4, Ad = "Yedek Parça Deposu", Aciklama = "Yedek parça ve sarf malzeme", SorumluPersonelId = 4, Aktif = true },
        new() { Id = 5, Ad = "Arşiv Deposu", Aciklama = "Eski ve kullanılmayan ekipmanlar", SorumluPersonelId = 5, Aktif = false },
    };

    public static List<Urun> Urunler { get; } = new()
    {
        new() { Id = 1, Ad = "Philips MX800 Hasta Monitörü", Barkod = "PHM001", KategoriId = 6, DepoId = 2, EkParcaVar = true, Birim = Birim.Adet, Maliyet = 45000, KdvOrani = 18, GarantiSuresiAy = 24, BozuldugundaBakimTipi = BakimTipi.Kalibrasyon, StokMiktari = 5, Durum = UrunDurum.Aktif },
        new() { Id = 2, Ad = "GE Voluson E8 Ultrason", Barkod = "GEU002", KategoriId = 5, DepoId = 2, EkParcaVar = true, Birim = Birim.Adet, Maliyet = 320000, KdvOrani = 18, GarantiSuresiAy = 36, BozuldugundaBakimTipi = BakimTipi.Kalibrasyon, StokMiktari = 2, Durum = UrunDurum.Aktif },
        new() { Id = 3, Ad = "Siemens Mobilett XP Röntgen", Barkod = "SMR003", KategoriId = 5, DepoId = 2, EkParcaVar = true, Birim = Birim.Adet, Maliyet = 180000, KdvOrani = 18, GarantiSuresiAy = 24, BozuldugundaBakimTipi = BakimTipi.Kalibrasyon, StokMiktari = 1, Durum = UrunDurum.Bakimda },
        new() { Id = 4, Ad = "Drager Evita V300 Ventilatör", Barkod = "DRV004", KategoriId = 7, DepoId = 2, EkParcaVar = true, Birim = Birim.Adet, Maliyet = 95000, KdvOrani = 18, GarantiSuresiAy = 24, BozuldugundaBakimTipi = BakimTipi.Bakim, StokMiktari = 8, Durum = UrunDurum.Aktif },
        new() { Id = 5, Ad = "Dell OptiPlex 7090 Bilgisayar", Barkod = "DLC005", KategoriId = 8, DepoId = 3, EkParcaVar = false, Birim = Birim.Adet, Maliyet = 18000, KdvOrani = 18, GarantiSuresiAy = 36, BozuldugundaBakimTipi = BakimTipi.Bakim, StokMiktari = 25, Durum = UrunDurum.Aktif },
        new() { Id = 6, Ad = "HP LaserJet Pro M404dn Yazıcı", Barkod = "HPP006", KategoriId = 9, DepoId = 3, EkParcaVar = false, Birim = Birim.Adet, Maliyet = 4500, KdvOrani = 18, GarantiSuresiAy = 12, BozuldugundaBakimTipi = BakimTipi.Bakim, StokMiktari = 15, Durum = UrunDurum.Aktif },
        new() { Id = 7, Ad = "Roche Cobas c311 Biyokimya Analizörü", Barkod = "RCA007", KategoriId = 10, DepoId = 2, EkParcaVar = true, Birim = Birim.Adet, Maliyet = 250000, KdvOrani = 18, GarantiSuresiAy = 24, BozuldugundaBakimTipi = BakimTipi.Kalibrasyon, StokMiktari = 1, Durum = UrunDurum.TamirBekliyor },
        new() { Id = 8, Ad = "Sysmex XN-1000 Hematoloji Analizörü", Barkod = "SYH008", KategoriId = 10, DepoId = 2, EkParcaVar = true, Birim = Birim.Adet, Maliyet = 180000, KdvOrani = 18, GarantiSuresiAy = 24, BozuldugundaBakimTipi = BakimTipi.Kalibrasyon, StokMiktari = 1, Durum = UrunDurum.TamirBekliyor },
        new() { Id = 9, Ad = "Mindray BeneHeart D6 Defibrilatör", Barkod = "MBD009", KategoriId = 6, DepoId = 2, EkParcaVar = true, Birim = Birim.Adet, Maliyet = 35000, KdvOrani = 18, GarantiSuresiAy = 24, BozuldugundaBakimTipi = BakimTipi.Kalibrasyon, StokMiktari = 6, Durum = UrunDurum.Bakimda },
        new() { Id = 10, Ad = "Lenovo ThinkPad T14 Dizüstü", Barkod = "LNT010", KategoriId = 8, DepoId = 3, EkParcaVar = false, Birim = Birim.Adet, Maliyet = 25000, KdvOrani = 18, GarantiSuresiAy = 36, BozuldugundaBakimTipi = BakimTipi.Bakim, StokMiktari = 10, Durum = UrunDurum.Aktif },
    };

    public static List<Cari> Cariler { get; } = new()
    {
        new() { Id = 1, FirmaAdi = "MedTech Tıbbi Cihazlar A.Ş.", Tip = CariTipi.Tedarikci, VergiNo = "1234567890", VergiDairesi = "Büyük Mükellefler", Adres = "Atatürk Cad. No:123", Il = "İstanbul", Ilce = "Şişli", Telefon = "0212 333 4455", Fax = "0212 333 4456", Email = "info@medtech.com.tr", WebSitesi = "www.medtech.com.tr", YetkiliKisi = "Hakan Özdemir", YetkiliTelefon = "0532 999 8877", BankaAdi = "Garanti Bankası", IbanNo = "TR12 0006 2000 0001 2345 6789 00", Aktif = true },
        new() { Id = 2, FirmaAdi = "BioLab Laboratuvar Sistemleri Ltd.", Tip = CariTipi.Tedarikci, VergiNo = "2345678901", VergiDairesi = "Kadıköy", Adres = "İnönü Mah. Bilim Sok. No:45", Il = "İstanbul", Ilce = "Kadıköy", Telefon = "0216 444 5566", Email = "satis@biolab.com.tr", YetkiliKisi = "Selin Aktaş", YetkiliTelefon = "0533 888 7766", Aktif = true },
        new() { Id = 3, FirmaAdi = "TechPro Bilişim Hizmetleri", Tip = CariTipi.Tedarikci, VergiNo = "3456789012", VergiDairesi = "Mecidiyeköy", Adres = "Gayrettepe İş Merkezi K:5", Il = "İstanbul", Ilce = "Beşiktaş", Telefon = "0212 555 6677", Email = "info@techpro.com.tr", YetkiliKisi = "Burak Yıldırım", Aktif = true },
        new() { Id = 4, FirmaAdi = "Medikal Plus Sağlık Ürünleri", Tip = CariTipi.Tedarikci, VergiNo = "4567890123", VergiDairesi = "Konak", Adres = "Alsancak Mah. 1453 Sok. No:12", Il = "İzmir", Ilce = "Konak", Telefon = "0232 666 7788", Email = "siparis@medikalplus.com", YetkiliKisi = "Deniz Aydın", Aktif = true },
        new() { Id = 5, FirmaAdi = "Servis Teknik Mühendislik", Tip = CariTipi.Tedarikci, VergiNo = "5678901234", VergiDairesi = "Çankaya", Adres = "Kızılay Mah. Bakım Sok. No:8", Il = "Ankara", Ilce = "Çankaya", Telefon = "0312 777 8899", Email = "servis@servisteknik.com", YetkiliKisi = "Ali Vural", Aktif = true },
    };

    public static List<Fatura> Faturalar { get; } = new()
    {
        new() { Id = 1, FaturaNo = "FTR-2026-001", CariId = 1, FaturaTarihi = new DateTime(2026, 1, 5), AraToplam = 270000, ToplamIndirim = 0, ToplamKdv = 48600, GenelToplam = 318600, Aciklama = "Hasta monitörü alımı" },
        new() { Id = 2, FaturaNo = "FTR-2026-002", CariId = 2, FaturaTarihi = new DateTime(2026, 1, 10), AraToplam = 250000, ToplamIndirim = 12500, ToplamKdv = 42750, GenelToplam = 280250, Aciklama = "Biyokimya analizörü" },
        new() { Id = 3, FaturaNo = "FTR-2026-003", CariId = 3, FaturaTarihi = new DateTime(2026, 1, 15), AraToplam = 90000, ToplamIndirim = 0, ToplamKdv = 16200, GenelToplam = 106200, Aciklama = "Bilgisayar alımı (5 adet)" },
        new() { Id = 4, FaturaNo = "FTR-2026-004", CariId = 1, FaturaTarihi = new DateTime(2026, 1, 20), AraToplam = 95000, ToplamIndirim = 5000, ToplamKdv = 16200, GenelToplam = 106200, Aciklama = "Ventilatör alımı" },
        new() { Id = 5, FaturaNo = "FTR-2026-005", CariId = 5, FaturaTarihi = new DateTime(2026, 1, 25), AraToplam = 15000, ToplamIndirim = 0, ToplamKdv = 2700, GenelToplam = 17700, Aciklama = "Bakım ve onarım hizmeti" },
    };

    public static List<FaturaKalemi> FaturaKalemleri { get; } = new()
    {
        new() { Id = 1, FaturaId = 1, UrunId = 1, UrunAdi = "Philips MX800 Hasta Monitörü", Miktar = 6, BirimFiyat = 45000, IndirimOrani = 0, KdvOrani = 18, Toplam = 318600 },
        new() { Id = 2, FaturaId = 2, UrunId = 7, UrunAdi = "Roche Cobas c311 Biyokimya Analizörü", Miktar = 1, BirimFiyat = 250000, IndirimOrani = 5, KdvOrani = 18, Toplam = 280250 },
        new() { Id = 3, FaturaId = 3, UrunId = 5, UrunAdi = "Dell OptiPlex 7090 Bilgisayar", Miktar = 5, BirimFiyat = 18000, IndirimOrani = 0, KdvOrani = 18, Toplam = 106200 },
        new() { Id = 4, FaturaId = 4, UrunId = 4, UrunAdi = "Drager Evita V300 Ventilatör", Miktar = 1, BirimFiyat = 95000, IndirimOrani = 5.26m, KdvOrani = 18, Toplam = 106200 },
        new() { Id = 5, FaturaId = 5, UrunAdi = "Röntgen Cihazı Periyodik Bakım", Miktar = 1, BirimFiyat = 15000, IndirimOrani = 0, KdvOrani = 18, Toplam = 17700 },
    };

    public static List<Zimmet> Zimmetler { get; } = new()
    {
        new() { Id = 1, UrunId = 5, PersonelId = 1, ZimmetTarihi = new DateTime(2026, 1, 10), Durum = ZimmetDurum.Aktif, Aciklama = "BT departmanı için" },
        new() { Id = 2, UrunId = 10, PersonelId = 2, ZimmetTarihi = new DateTime(2026, 1, 12), Durum = ZimmetDurum.Aktif, Aciklama = "Muhasebe dizüstü bilgisayar" },
        new() { Id = 3, UrunId = 6, PersonelId = 4, ZimmetTarihi = new DateTime(2026, 1, 15), Durum = ZimmetDurum.Aktif, Aciklama = "Satın alma yazıcısı" },
        new() { Id = 4, UrunId = 5, PersonelId = 3, ZimmetTarihi = new DateTime(2026, 1, 18), Durum = ZimmetDurum.Aktif, Aciklama = "Teknik servis bilgisayarı" },
        new() { Id = 5, UrunId = 10, PersonelId = 6, ZimmetTarihi = new DateTime(2026, 1, 22), Durum = ZimmetDurum.Aktif, Aciklama = "Laboratuvar dizüstü" },
        new() { Id = 6, UrunId = 6, PersonelId = 5, ZimmetTarihi = new DateTime(2026, 1, 25), Durum = ZimmetDurum.Aktif, Aciklama = "Depo yönetimi yazıcısı" },
    };

    // ===== ROL TABANLI ERİŞİM KONTROL VERİLERİ =====
    
    public static List<Role> Roller { get; } = new()
    {
        new() 
        { 
            Id = 1, 
            Name = "Admin", 
            Description = "Sistem yöneticisi - Tüm yetkilere sahip",
            PagePermissions = "[\"dashboard\", \"depolar\", \"urunler\", \"faturalar\", \"cariler\", \"kategoriler\", \"personeller\", \"zimmetler\", \"kullanicilar\", \"roller\", \"talepler\", \"loglar\"]",
            EntityPermissions = "{\"cari\": [\"add\", \"edit\", \"delete\"], \"depo\": [\"add\", \"edit\", \"delete\"], \"kategori\": [\"add\", \"edit\", \"delete\"], \"kullanici\": [\"add\", \"edit\", \"delete\"]}"
        },
        new() 
        { 
            Id = 2, 
            Name = "Kullanici", 
            Description = "Standart kullanıcı - Sadece görüntüleme ve talep oluşturma",
            PagePermissions = "[\"dashboard\", \"depolar\", \"urunler\", \"kategoriler\", \"zimmetler\", \"talep-olustur\"]",
            EntityPermissions = "{}"
        },
    };

    public static List<User> Users { get; } = new()
    {
        new() { Id = 1, Username = "admin", Password = "admin123", Email = "admin@canhastanesi.com", FullName = "Sistem Yöneticisi", RoleId = 1, IsActive = true, CreatedAt = new DateTime(2025, 1, 1) },
        new() { Id = 2, Username = "user", Password = "user123", Email = "user@canhastanesi.com", FullName = "Demo Kullanıcı", RoleId = 2, IsActive = true, CreatedAt = new DateTime(2025, 6, 1) },
        new() { Id = 3, Username = "ahmet.yilmaz", Password = "ahmet123", Email = "ahmet.yilmaz@canhastanesi.com", FullName = "Ahmet Yılmaz", RoleId = 2, IsActive = true, CreatedAt = new DateTime(2025, 3, 15) },
    };

    public static List<Talep> Talepler { get; } = new()
    {
        new() 
        { 
            Id = 1, 
            TalepTipi = "CariEkleme", 
            TalepEdenUserId = 2, 
            TalepEdenUserName = "Demo Kullanıcı",
            Baslik = "Yeni Tedarikçi Ekleme Talebi", 
            Detaylar = "Medikal malzeme tedarikçisi eklenmesi gerekiyor",
            TalepData = "{\"firmaAdi\": \"ABC Medikal Ltd.\", \"tip\": \"Tedarikci\", \"vergiNo\": \"9876543210\", \"il\": \"Ankara\"}",
            Durum = "Beklemede",
            OlusturmaTarihi = new DateTime(2026, 1, 25, 10, 30, 0)
        },
        new() 
        { 
            Id = 2, 
            TalepTipi = "DepoEkleme", 
            TalepEdenUserId = 3, 
            TalepEdenUserName = "Ahmet Yılmaz",
            Baslik = "Yeni Depo Alanı Talebi", 
            Detaylar = "Acil servis için ayrı bir depo alanı gerekiyor",
            TalepData = "{\"ad\": \"Acil Servis Deposu\", \"aciklama\": \"Acil servis tıbbi malzeme deposu\"}",
            Durum = "Beklemede",
            OlusturmaTarihi = new DateTime(2026, 1, 26, 14, 15, 0)
        },
        new() 
        { 
            Id = 3, 
            TalepTipi = "KategoriEkleme", 
            TalepEdenUserId = 2, 
            TalepEdenUserName = "Demo Kullanıcı",
            Baslik = "Cerrahi Aletler Kategorisi", 
            Detaylar = "Cerrahi aletler için yeni bir kategori oluşturulması",
            TalepData = "{\"ad\": \"Cerrahi Aletler\", \"aciklama\": \"Ameliyathane cerrahi aletleri\", \"ustKategoriId\": 1}",
            Durum = "Onaylandi",
            OnaylayanUserId = 1,
            OnaylayanUserName = "Sistem Yöneticisi",
            OnayTarihi = new DateTime(2026, 1, 24, 16, 0, 0),
            OlusturmaTarihi = new DateTime(2026, 1, 23, 9, 0, 0)
        },
    };

    public static List<SystemLog> SystemLogs { get; } = new()
    {
        new() { Id = 1, UserId = 1, UserName = "Sistem Yöneticisi", Action = "Login", EntityType = "User", Details = "Sisteme giriş yapıldı", Timestamp = new DateTime(2026, 1, 29, 8, 0, 0) },
        new() { Id = 2, UserId = 1, UserName = "Sistem Yöneticisi", Action = "Create", EntityType = "Urun", EntityId = 10, Details = "Lenovo ThinkPad T14 Dizüstü eklendi", Timestamp = new DateTime(2026, 1, 28, 14, 30, 0) },
        new() { Id = 3, UserId = 1, UserName = "Sistem Yöneticisi", Action = "Approve", EntityType = "Talep", EntityId = 3, Details = "Cerrahi Aletler Kategorisi talebi onaylandı", Timestamp = new DateTime(2026, 1, 24, 16, 0, 0) },
        new() { Id = 4, UserId = 2, UserName = "Demo Kullanıcı", Action = "Login", EntityType = "User", Details = "Sisteme giriş yapıldı", Timestamp = new DateTime(2026, 1, 25, 10, 0, 0) },
        new() { Id = 5, UserId = 2, UserName = "Demo Kullanıcı", Action = "Create", EntityType = "Talep", EntityId = 1, Details = "Yeni tedarikçi ekleme talebi oluşturuldu", Timestamp = new DateTime(2026, 1, 25, 10, 30, 0) },
    };
}
