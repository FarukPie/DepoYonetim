import {
    Dashboard, Depo, MalzemeKalemi, Kategori, Personel, Cari, Fatura, Zimmet, Talep, FaturaKalemi, SystemLog, AuthUser, User, UserCreate, UserUpdate, Role, RoleCreate, PageOption, PermissionOption, TalepCreate
} from '../types';

// ===== MOCK DATA - Türkçe ===== 
const personeller: Personel[] = [
    { id: 1, ad: 'Ahmet', soyad: 'Yılmaz', tamAd: 'Ahmet Yılmaz', tcNo: '12345678901', departman: 'Bilgi İşlem', unvan: 'Sistem Yöneticisi', telefon: '0532 111 2233', email: 'ahmet.yilmaz@canhastanesi.com', iseGirisTarihi: '2020-03-15', aktif: true, zimmetSayisi: 2 },
    { id: 2, ad: 'Fatma', soyad: 'Demir', tamAd: 'Fatma Demir', tcNo: '23456789012', departman: 'Muhasebe', unvan: 'Muhasebe Uzmanı', telefon: '0533 222 3344', email: 'fatma.demir@canhastanesi.com', iseGirisTarihi: '2019-07-01', aktif: true, zimmetSayisi: 1 },
    { id: 3, ad: 'Mehmet', soyad: 'Kaya', tamAd: 'Mehmet Kaya', tcNo: '34567890123', departman: 'Teknik Servis', unvan: 'Biyomedikal Tekniker', telefon: '0534 333 4455', email: 'mehmet.kaya@canhastanesi.com', iseGirisTarihi: '2021-01-10', aktif: true, zimmetSayisi: 1 },
    { id: 4, ad: 'Ayşe', soyad: 'Çelik', tamAd: 'Ayşe Çelik', tcNo: '45678901234', departman: 'Satın Alma', unvan: 'Satın Alma Sorumlusu', telefon: '0535 444 5566', email: 'ayse.celik@canhastanesi.com', iseGirisTarihi: '2018-09-20', aktif: true, zimmetSayisi: 1 },
    { id: 5, ad: 'Can', soyad: 'Öztürk', tamAd: 'Can Öztürk', tcNo: '56789012345', departman: 'Yönetim', unvan: 'Depo Müdürü', telefon: '0536 555 6677', email: 'can.ozturk@canhastanesi.com', iseGirisTarihi: '2017-04-05', aktif: true, zimmetSayisi: 1 },
    { id: 6, ad: 'Zeynep', soyad: 'Arslan', tamAd: 'Zeynep Arslan', tcNo: '67890123456', departman: 'Laboratuvar', unvan: 'Laborant', telefon: '0537 666 7788', email: 'zeynep.arslan@canhastanesi.com', iseGirisTarihi: '2022-02-14', aktif: true, zimmetSayisi: 0 },
];

const kategoriler: Kategori[] = [
    { id: 1, ad: 'Tıbbi Cihazlar', aciklama: 'Tüm tıbbi cihaz ve ekipmanlar', ustKategoriId: undefined, ustKategoriAdi: undefined, altKategoriSayisi: 3, urunSayisi: 0 },
    { id: 2, ad: 'Ofis Ekipmanları', aciklama: 'Bilgisayar, yazıcı vb.', ustKategoriId: undefined, ustKategoriAdi: undefined, altKategoriSayisi: 2, urunSayisi: 0 },
    { id: 3, ad: 'Mobilya', aciklama: 'Masa, sandalye, dolap vb.', ustKategoriId: undefined, ustKategoriAdi: undefined, altKategoriSayisi: 0, urunSayisi: 0 },
    { id: 4, ad: 'Laboratuvar Ekipmanları', aciklama: 'Laboratuvar cihazları', ustKategoriId: undefined, ustKategoriAdi: undefined, altKategoriSayisi: 1, urunSayisi: 0 },
    { id: 5, ad: 'Görüntüleme Cihazları', aciklama: 'MR, BT, Röntgen', ustKategoriId: 1, ustKategoriAdi: 'Tıbbi Cihazlar', altKategoriSayisi: 0, urunSayisi: 2 },
    { id: 6, ad: 'Hasta Monitörleri', aciklama: 'Vital bulgu takip cihazları', ustKategoriId: 1, ustKategoriAdi: 'Tıbbi Cihazlar', altKategoriSayisi: 0, urunSayisi: 2 },
    { id: 7, ad: 'Solunum Cihazları', aciklama: 'Ventilatör, oksijen konsantratörü', ustKategoriId: 1, ustKategoriAdi: 'Tıbbi Cihazlar', altKategoriSayisi: 0, urunSayisi: 1 },
    { id: 8, ad: 'Bilgisayarlar', aciklama: 'Masaüstü ve dizüstü bilgisayarlar', ustKategoriId: 2, ustKategoriAdi: 'Ofis Ekipmanları', altKategoriSayisi: 0, urunSayisi: 2 },
    { id: 9, ad: 'Yazıcılar', aciklama: 'Yazıcı ve tarayıcılar', ustKategoriId: 2, ustKategoriAdi: 'Ofis Ekipmanları', altKategoriSayisi: 0, urunSayisi: 1 },
    { id: 10, ad: 'Analiz Cihazları', aciklama: 'Biyokimya, hematoloji analizörleri', ustKategoriId: 4, ustKategoriAdi: 'Laboratuvar Ekipmanları', altKategoriSayisi: 0, urunSayisi: 2 },
];

const depolar: Depo[] = [
    { id: 1, ad: 'Ana Depo', aciklama: 'Hastane ana deposu - Zemin kat', sorumluPersonelId: 5, sorumluPersonelAdi: 'Can Öztürk', aktif: true, urunSayisi: 0 },
    { id: 2, ad: 'Tıbbi Cihaz Deposu', aciklama: 'Tıbbi cihaz ve ekipmanlar deposu', sorumluPersonelId: 3, sorumluPersonelAdi: 'Mehmet Kaya', aktif: true, urunSayisi: 6 },
    { id: 3, ad: 'BT Deposu', aciklama: 'Bilgi teknolojileri ekipmanları', sorumluPersonelId: 1, sorumluPersonelAdi: 'Ahmet Yılmaz', aktif: true, urunSayisi: 3 },
    { id: 4, ad: 'Yedek Parça Deposu', aciklama: 'Yedek parça ve sarf malzeme', sorumluPersonelId: 4, sorumluPersonelAdi: 'Ayşe Çelik', aktif: true, urunSayisi: 1 },
    { id: 5, ad: 'Arşiv Deposu', aciklama: 'Eski ve kullanılmayan ekipmanlar', sorumluPersonelId: 5, sorumluPersonelAdi: 'Can Öztürk', aktif: false, urunSayisi: 0 },
];

const malzemeler: MalzemeKalemi[] = [
    { id: 1, ad: 'Philips MX800 Hasta Monitörü', dmbNo: 'DMB001', ekParcaVar: true, birim: 'Adet', rutin: 'Yıllık', aciklama: 'Yoğun bakım monitörü', state: 0 },
    { id: 2, ad: 'GE Voluson E8 Ultrason', dmbNo: 'DMB002', ekParcaVar: true, birim: 'Adet', rutin: '6 Aylık', aciklama: 'Kadın doğum ultrasonu', state: 0 },
    { id: 3, ad: 'Siemens Mobilett XP Röntgen', dmbNo: 'DMB003', ekParcaVar: true, birim: 'Adet', rutin: 'Yıllık', aciklama: 'Mobil röntgen cihazı', state: 1 }, // Bakımda
    { id: 4, ad: 'Drager Evita V300 Ventilatör', dmbNo: 'DMB004', ekParcaVar: true, birim: 'Adet', rutin: '6 Aylık', aciklama: 'Yoğun bakım ventilatörü', state: 0 },
    { id: 5, ad: 'Dell OptiPlex 7090 Bilgisayar', dmbNo: 'DMB005', ekParcaVar: false, birim: 'Adet', rutin: 'Yıllık', aciklama: 'Ofis bilgisayarı', state: 0 },
    { id: 6, ad: 'HP LaserJet Pro M404dn Yazıcı', dmbNo: 'DMB006', ekParcaVar: false, birim: 'Adet', rutin: 'Yıllık', aciklama: 'Lazer yazıcı', state: 0 },
    { id: 7, ad: 'Roche Cobas c311 Biyokimya Analizörü', dmbNo: 'DMB007', ekParcaVar: true, birim: 'Adet', rutin: '3 Aylık', aciklama: 'Biyokimya otoanalizör', state: 2 }, // Tamir Bekliyor
    { id: 8, ad: 'Sysmex XN-1000 Hematoloji Analizörü', dmbNo: 'DMB008', ekParcaVar: true, birim: 'Adet', rutin: '3 Aylık', aciklama: 'Kan sayım cihazı', state: 2 }, // Tamir Bekliyor
    { id: 9, ad: 'Mindray BeneHeart D6 Defibrilatör', dmbNo: 'DMB009', ekParcaVar: true, birim: 'Adet', rutin: 'Yıllık', aciklama: 'Defibrilatör', state: 1 }, // Bakımda
    { id: 10, ad: 'Lenovo ThinkPad T14 Dizüstü', dmbNo: 'DMB010', ekParcaVar: false, birim: 'Adet', rutin: 'Yıllık', aciklama: 'Taşınabilir bilgisayar', state: 0 },
];

const cariler: Cari[] = [
    { id: 1, firmaAdi: 'MedTech Tıbbi Cihazlar A.Ş.', tip: 'Tedarikci', vergiNo: '1234567890', vergiDairesi: 'Büyük Mükellefler', adres: 'Atatürk Cad. No:123', il: 'İstanbul', ilce: 'Şişli', telefon: '0212 333 4455', email: 'info@medtech.com.tr', yetkiliKisi: 'Hakan Özdemir', yetkiliTelefon: '0532 999 8877' },
    { id: 2, firmaAdi: 'BioLab Laboratuvar Sistemleri Ltd.', tip: 'Tedarikci', vergiNo: '2345678901', vergiDairesi: 'Kadıköy', adres: 'İnönü Mah. Bilim Sok. No:45', il: 'İstanbul', ilce: 'Kadıköy', telefon: '0216 444 5566', email: 'satis@biolab.com.tr', yetkiliKisi: 'Selin Aktaş', yetkiliTelefon: '0533 888 7766' },
    { id: 3, firmaAdi: 'TechPro Bilişim Hizmetleri', tip: 'Tedarikci', vergiNo: '3456789012', vergiDairesi: 'Mecidiyeköy', adres: 'Gayrettepe İş Merkezi K:5', il: 'İstanbul', ilce: 'Beşiktaş', telefon: '0212 555 6677', email: 'info@techpro.com.tr', yetkiliKisi: 'Burak Yıldırım' },
    { id: 4, firmaAdi: 'Medikal Plus Sağlık Ürünleri', tip: 'Tedarikci', vergiNo: '4567890123', vergiDairesi: 'Konak', adres: 'Alsancak Mah. 1453 Sok. No:12', il: 'İzmir', ilce: 'Konak', telefon: '0232 666 7788', email: 'siparis@medikalplus.com', yetkiliKisi: 'Deniz Aydın' },
    { id: 5, firmaAdi: 'Servis Teknik Mühendislik', tip: 'Tedarikci', vergiNo: '5678901234', vergiDairesi: 'Çankaya', adres: 'Kızılay Mah. Bakım Sok. No:8', il: 'Ankara', ilce: 'Çankaya', telefon: '0312 777 8899', email: 'servis@servisteknik.com', yetkiliKisi: 'Ali Vural' },
];

const faturalar: Fatura[] = [
    { id: 1, faturaNo: 'FTR-2026-001', cariId: 1, cariAdi: 'MedTech Tıbbi Cihazlar A.Ş.', faturaTarihi: '2026-01-05', araToplam: 270000, toplamIndirim: 0, toplamKdv: 48600, genelToplam: 318600, aciklama: 'Hasta monitörü alımı', kalemler: [{ id: 1, malzemeKalemiId: 1, malzemeAdi: 'Philips MX800 Hasta Monitörü', miktar: 6, birimFiyat: 45000, indirimOrani: 0, kdvOrani: 18, toplam: 318600, zimmetDurum: false }] },
    { id: 2, faturaNo: 'FTR-2026-002', cariId: 2, cariAdi: 'BioLab Laboratuvar Sistemleri Ltd.', faturaTarihi: '2026-01-10', araToplam: 250000, toplamIndirim: 12500, toplamKdv: 42750, genelToplam: 280250, aciklama: 'Biyokimya analizörü', kalemler: [{ id: 2, malzemeKalemiId: 7, malzemeAdi: 'Roche Cobas c311 Biyokimya Analizörü', miktar: 1, birimFiyat: 250000, indirimOrani: 5, kdvOrani: 18, toplam: 280250, zimmetDurum: false }] },
    { id: 3, faturaNo: 'FTR-2026-003', cariId: 3, cariAdi: 'TechPro Bilişim Hizmetleri', faturaTarihi: '2026-01-15', araToplam: 90000, toplamIndirim: 0, toplamKdv: 16200, genelToplam: 106200, aciklama: 'Bilgisayar alımı (5 adet)', kalemler: [{ id: 3, malzemeKalemiId: 5, malzemeAdi: 'Dell OptiPlex 7090 Bilgisayar', miktar: 5, birimFiyat: 18000, indirimOrani: 0, kdvOrani: 18, toplam: 106200, zimmetDurum: false }] },
    { id: 4, faturaNo: 'FTR-2026-004', cariId: 1, cariAdi: 'MedTech Tıbbi Cihazlar A.Ş.', faturaTarihi: '2026-01-20', araToplam: 95000, toplamIndirim: 5000, toplamKdv: 16200, genelToplam: 106200, aciklama: 'Ventilatör alımı', kalemler: [{ id: 4, malzemeKalemiId: 4, malzemeAdi: 'Drager Evita V300 Ventilatör', miktar: 1, birimFiyat: 95000, indirimOrani: 5.26, kdvOrani: 18, toplam: 106200, zimmetDurum: false }] },
    { id: 5, faturaNo: 'FTR-2026-005', cariId: 5, cariAdi: 'Servis Teknik Mühendislik', faturaTarihi: '2026-01-25', araToplam: 15000, toplamIndirim: 0, toplamKdv: 2700, genelToplam: 17700, aciklama: 'Bakım ve onarım hizmeti', kalemler: [{ id: 5, malzemeAdi: 'Röntgen Cihazı Periyodik Bakım', miktar: 1, birimFiyat: 15000, indirimOrani: 0, kdvOrani: 18, toplam: 17700, zimmetDurum: false }] },
];

const zimmetler: Zimmet[] = [
    { id: 1, faturaKalemiId: 3, malzemeAdi: 'Dell OptiPlex 7090 Bilgisayar', personelId: 1, personelAdi: 'Ahmet Yılmaz', zimmetTarihi: '2026-01-10', durum: 'Aktif', aciklama: 'BT departmanı için' },
    { id: 2, faturaKalemiId: 1, malzemeAdi: 'Philips MX800 Hasta Monitörü', personelId: 2, personelAdi: 'Fatma Demir', zimmetTarihi: '2026-01-12', durum: 'Aktif', aciklama: 'Hasta monitörü zimmetleme' },
    { id: 3, faturaKalemiId: 2, malzemeAdi: 'Roche Cobas c311 Biyokimya Analizörü', personelId: 4, personelAdi: 'Ayşe Çelik', zimmetTarihi: '2026-01-15', durum: 'Aktif', aciklama: 'Biyokimya analizörü' },
    { id: 4, faturaKalemiId: 3, malzemeAdi: 'Dell OptiPlex 7090 Bilgisayar', personelId: 3, personelAdi: 'Mehmet Kaya', zimmetTarihi: '2026-01-18', durum: 'Aktif', aciklama: 'Teknik servis bilgisayarı' },
    { id: 5, faturaKalemiId: 4, malzemeAdi: 'Drager Evita V300 Ventilatör', personelId: 1, personelAdi: 'Ahmet Yılmaz', zimmetTarihi: '2026-01-22', durum: 'Aktif', aciklama: 'Ventilatör zimmetleme' },
    { id: 6, faturaKalemiId: 1, malzemeAdi: 'Philips MX800 Hasta Monitörü', personelId: 5, personelAdi: 'Can Öztürk', zimmetTarihi: '2026-01-25', durum: 'Aktif', aciklama: 'Depo yönetimi monitörü' },
];

// ===== SERVICE FUNCTIONS =====
// Bakım Talepleri (in-memory store)
interface BakimTalebi {
    id: number;
    urunId: number;
    urunAdi: string;
    talepTipi: 'Bakim' | 'Tamir';
    hataTanimi: string;
    detaylar: string;
    talepTarihi: string;
    oncelik: 'Dusuk' | 'Normal' | 'Yuksek' | 'Acil';
    durum: 'Beklemede' | 'Isleniyor' | 'Tamamlandi';
    olusturanKisi: string;
}

const bakimTalepleri: BakimTalebi[] = [
    { id: 1, urunId: 3, urunAdi: 'Siemens Mobilett XP Röntgen', talepTipi: 'Bakim', hataTanimi: 'Periyodik bakım zamanı geldi', detaylar: 'Yıllık kalibrasyon ve bakım gerekiyor', talepTarihi: '2026-01-20', oncelik: 'Normal', durum: 'Isleniyor', olusturanKisi: 'Mehmet Kaya' },
    { id: 2, urunId: 7, urunAdi: 'Roche Cobas c311 Biyokimya Analizörü', talepTipi: 'Tamir', hataTanimi: 'Numune okuma hatası', detaylar: 'Cihaz numune okurken hata veriyor, kalibrasyon yapılması gerekebilir', talepTarihi: '2026-01-22', oncelik: 'Yuksek', durum: 'Beklemede', olusturanKisi: 'Zeynep Arslan' },
    { id: 3, urunId: 8, urunAdi: 'Sysmex XN-1000 Hematoloji Analizörü', talepTipi: 'Tamir', hataTanimi: 'Ekran donuyor', detaylar: 'Cihaz çalışırken ekran donuyor ve yeniden başlatma gerekiyor', talepTarihi: '2026-01-25', oncelik: 'Acil', durum: 'Beklemede', olusturanKisi: 'Zeynep Arslan' },
];

export const mockDataService = {
    // Dashboard
    getDashboard: (): Dashboard => ({
        zimmetliCalisanSayisi: 5,
        toplamStok: malzemeler.length,
        toplamKategori: kategoriler.length,
        bakimdakiUrunSayisi: malzemeler.filter(u => u.state === 1).length,
        tamirBekleyenSayisi: malzemeler.filter(u => u.state === 2).length,
        sonZimmetler: zimmetler.slice(-5).reverse(),
        tamirBekleyenMalzemeler: malzemeler.filter(u => u.state === 2),
        onaylananTalepler: talepler.filter(t => t.durum === 'Onaylandi'),
        bakimdakiMalzemeler: malzemeler.filter(u => u.state === 1),
    }),

    // Depolar
    getDepolar: () => [...depolar],
    getDepo: (id: number) => depolar.find(d => d.id === id),
    addDepo: (depo: Omit<Depo, 'id' | 'urunSayisi'>) => {
        const newDepo = { ...depo, id: Math.max(...depolar.map(d => d.id)) + 1, urunSayisi: 0 };
        depolar.push(newDepo as Depo);
        return newDepo;
    },
    updateDepo: (id: number, data: Partial<Depo>) => {
        const index = depolar.findIndex(d => d.id === id);
        if (index > -1) {
            depolar[index] = { ...depolar[index], ...data };
            return depolar[index];
        }
    },
    deleteDepo: (id: number) => {
        const index = depolar.findIndex(d => d.id === id);
        if (index > -1) depolar.splice(index, 1);
    },

    // Malzemeler
    getMalzemeler: () => [...malzemeler],
    searchMalzemeler: (term: string) => malzemeler.filter(u => u.ad.toLowerCase().includes(term.toLowerCase())),
    getMalzeme: (id: number) => malzemeler.find(u => u.id === id),
    addMalzeme: (malzeme: Omit<MalzemeKalemi, 'id'>) => {
        const newMalzeme = { ...malzeme, id: Math.max(...malzemeler.map(u => u.id)) + 1 };
        malzemeler.push(newMalzeme as MalzemeKalemi);
        return newMalzeme;
    },
    updateMalzeme: (id: number, data: Partial<MalzemeKalemi>) => {
        const index = malzemeler.findIndex(u => u.id === id);
        if (index > -1) {
            malzemeler[index] = { ...malzemeler[index], ...data };
            return malzemeler[index];
        }
    },
    deleteMalzeme: (id: number) => {
        const index = malzemeler.findIndex(u => u.id === id);
        if (index > -1) malzemeler.splice(index, 1);
    },

    // Kategoriler
    getKategoriler: () => [...kategoriler],
    getAnaKategoriler: () => kategoriler.filter(k => !k.ustKategoriId),
    getAltKategoriler: (ustId: number) => kategoriler.filter(k => k.ustKategoriId === ustId),
    addKategori: (kategori: Omit<Kategori, 'id' | 'altKategoriSayisi' | 'urunSayisi'>) => {
        const newKategori = { ...kategori, id: Math.max(...kategoriler.map(k => k.id)) + 1, altKategoriSayisi: 0, urunSayisi: 0 };
        kategoriler.push(newKategori as Kategori);
        return newKategori;
    },
    updateKategori: (id: number, data: Partial<Kategori>) => {
        const index = kategoriler.findIndex(k => k.id === id);
        if (index > -1) {
            kategoriler[index] = { ...kategoriler[index], ...data };
            return kategoriler[index];
        }
    },
    deleteKategori: (id: number) => {
        const index = kategoriler.findIndex(k => k.id === id);
        if (index > -1) kategoriler.splice(index, 1);
    },

    // Personeller
    getPersoneller: () => [...personeller],
    searchPersoneller: (term: string) => personeller.filter(p =>
        p.tamAd.toLowerCase().includes(term.toLowerCase()) ||
        p.departman?.toLowerCase().includes(term.toLowerCase())
    ),
    getPersonel: (id: number) => personeller.find(p => p.id === id),
    addPersonel: (personel: Omit<Personel, 'id' | 'tamAd' | 'zimmetSayisi' | 'aktif'>) => {
        const newPersonel = { ...personel, id: Math.max(...personeller.map(p => p.id)) + 1, tamAd: `${personel.ad} ${personel.soyad}`, zimmetSayisi: 0, aktif: true };
        personeller.push(newPersonel as Personel);
        return newPersonel;
    },
    deletePersonel: (id: number) => {
        const index = personeller.findIndex(p => p.id === id);
        if (index > -1) personeller.splice(index, 1);
    },

    // Cariler
    getCariler: () => [...cariler],
    searchCariler: (term: string) => cariler.filter(c => c.firmaAdi.toLowerCase().includes(term.toLowerCase())),
    getCari: (id: number) => cariler.find(c => c.id === id),
    addCari: (cari: Omit<Cari, 'id'>) => {
        const newCari = { ...cari, id: Math.max(...cariler.map(c => c.id)) + 1 };
        cariler.push(newCari as Cari);
        return newCari;
    },
    deleteCari: (id: number) => {
        const index = cariler.findIndex(c => c.id === id);
        if (index > -1) cariler.splice(index, 1);
    },

    // Faturalar
    getFaturalar: () => [...faturalar],
    getFaturaByDateRange: (start: string, end: string) =>
        faturalar.filter(f => f.faturaTarihi >= start && f.faturaTarihi <= end),
    getFaturaByCari: (cariId: number) => faturalar.filter(f => f.cariId === cariId),
    addFatura: (fatura: Omit<Fatura, 'id' | 'araToplam' | 'toplamIndirim' | 'toplamKdv' | 'genelToplam'>) => {
        let araToplam = 0, toplamIndirim = 0, toplamKdv = 0;
        fatura.kalemler.forEach(k => {
            const kalemToplam = k.miktar * k.birimFiyat;
            const indirim = kalemToplam * (k.indirimOrani / 100);
            const kdv = (kalemToplam - indirim) * (k.kdvOrani / 100);
            araToplam += kalemToplam;
            toplamIndirim += indirim;
            toplamKdv += kdv;
        });
        const newFatura = { ...fatura, id: Math.max(...faturalar.map(f => f.id)) + 1, araToplam, toplamIndirim, toplamKdv, genelToplam: araToplam - toplamIndirim + toplamKdv };
        faturalar.push(newFatura as Fatura);
        return newFatura;
    },

    // Zimmetler  
    getZimmetler: () => [...zimmetler],
    getSonZimmetler: (count: number) => zimmetler.slice(-count).reverse(),
    addZimmet: (zimmet: Omit<Zimmet, 'id'>) => {
        const newZimmet = { ...zimmet, id: Math.max(...zimmetler.map(z => z.id)) + 1 };
        zimmetler.push(newZimmet as Zimmet);
        return newZimmet;
    },
    updateZimmet: (id: number, data: Partial<Zimmet>) => {
        const index = zimmetler.findIndex(z => z.id === id);
        if (index > -1) {
            zimmetler[index] = { ...zimmetler[index], ...data };
            return zimmetler[index];
        }
    },
    deleteZimmet: (id: number) => {
        const index = zimmetler.findIndex(z => z.id === id);
        if (index > -1) zimmetler.splice(index, 1);
    },

    // Bakım Talepleri
    getBakimTalepleri: () => [...bakimTalepleri],
    getBakimTalebiByUrun: (urunId: number) => bakimTalepleri.filter(b => b.urunId === urunId),
    addBakimTalebi: (talep: Omit<BakimTalebi, 'id' | 'durum'>) => {
        const newTalep: BakimTalebi = {
            ...talep,
            id: bakimTalepleri.length > 0 ? Math.max(...bakimTalepleri.map(b => b.id)) + 1 : 1,
            durum: 'Beklemede'
        };
        bakimTalepleri.push(newTalep);

        // Talepler listesine de ekle
        const currentUser = authService.getCurrentUser();
        taleplerService.create({
            talepTipi: talep.talepTipi,
            talepEdenUserId: currentUser?.id || 1, // Default to admin if no user
            baslik: `${talep.urunAdi} - ${talep.talepTipi === 'Tamir' ? 'Tamir' : 'Bakım'} Talebi`,
            detaylar: talep.hataTanimi,
            talepData: JSON.stringify({
                urunId: talep.urunId,
                urunAdi: talep.urunAdi,
                oncelik: talep.oncelik,
                detaylar: talep.detaylar,
                talepTarihi: talep.talepTarihi
            })
        });

        // Ürün durumunu güncelle
        const urunIndex = malzemeler.findIndex(u => u.id === talep.urunId);
        if (urunIndex > -1) {
            malzemeler[urunIndex].state = talep.talepTipi === 'Tamir' ? 2 : 1;
        }
        return newTalep;
    },
};

const roles: Role[] = [
    {
        id: 1,
        name: 'Admin',
        description: 'Sistem yöneticisi - Tüm yetkilere sahip',
        pagePermissions: ['dashboard', 'depolar', 'malzemeler', 'faturalar', 'cariler', 'kategoriler', 'personeller', 'bolumler', 'zimmetler', 'kullanicilar', 'roller', 'talepler', 'loglar'],
        entityPermissions: {
            cari: ['add', 'edit', 'delete'],
            depo: ['add', 'edit', 'delete'],
            kategori: ['add', 'edit', 'delete'],
            kullanici: ['add', 'edit', 'delete'],
            fatura: ['add', 'edit', 'delete'],
            malzeme: ['add', 'edit', 'delete'],
            personel: ['add', 'edit', 'delete'],
            zimmet: ['add', 'edit', 'delete'],
            bolum: ['add', 'edit', 'delete']
        }
    },
    {
        id: 2,
        name: 'Kullanici',
        description: 'Standart kullanıcı - Sadece görüntüleme ve talep oluşturma',
        pagePermissions: ['dashboard', 'depolar', 'malzemeler', 'kategoriler', 'zimmetler', 'talep-olustur'],
        entityPermissions: {}
    },
];

const users: User[] = [
    { id: 1, username: 'admin', email: 'admin@canhastanesi.com', fullName: 'Sistem Yöneticisi', roleId: 1, roleName: 'Admin', isActive: true, createdAt: '2025-01-01' },
    { id: 2, username: 'user', email: 'user@canhastanesi.com', fullName: 'Demo Kullanıcı', roleId: 2, roleName: 'Kullanici', isActive: true, createdAt: '2025-06-01' },
    { id: 3, username: 'ahmet.yilmaz', email: 'ahmet.yilmaz@canhastanesi.com', fullName: 'Ahmet Yılmaz', roleId: 2, roleName: 'Kullanici', isActive: true, createdAt: '2025-03-15' },
];

const userPasswords: Record<string, string> = {
    'admin': 'admin123',
    'user': 'user123',
    'ahmet.yilmaz': 'ahmet123',
};

const talepler: Talep[] = [
    { id: 1, talepTipi: 'CariEkleme', talepEdenUserId: 2, talepEdenUserName: 'Demo Kullanıcı', baslik: 'Yeni Tedarikçi Ekleme Talebi', detaylar: 'Medikal malzeme tedarikçisi eklenmesi gerekiyor', talepData: JSON.stringify({ firmaAdi: 'ABC Medikal Ltd.', tip: 'Tedarikci', vergiNo: '9876543210', il: 'Ankara' }), durum: 'Beklemede', olusturmaTarihi: '2026-01-25T10:30:00' },
    { id: 2, talepTipi: 'DepoEkleme', talepEdenUserId: 3, talepEdenUserName: 'Ahmet Yılmaz', baslik: 'Yeni Depo Alanı Talebi', detaylar: 'Acil servis için ayrı bir depo alanı gerekiyor', talepData: JSON.stringify({ ad: 'Acil Servis Deposu', aciklama: 'Acil servis tıbbi malzeme deposu' }), durum: 'Beklemede', olusturmaTarihi: '2026-01-26T14:15:00' },
    { id: 3, talepTipi: 'KategoriEkleme', talepEdenUserId: 2, talepEdenUserName: 'Demo Kullanıcı', baslik: 'Cerrahi Aletler Kategorisi', detaylar: 'Cerrahi aletler için yeni bir kategori oluşturulması', talepData: JSON.stringify({ ad: 'Cerrahi Aletler', aciklama: 'Ameliyathane cerrahi aletleri', ustKategoriId: 1 }), durum: 'Onaylandi', onaylayanUserId: 1, onaylayanUserName: 'Sistem Yöneticisi', onayTarihi: '2026-01-24T16:00:00', olusturmaTarihi: '2026-01-23T09:00:00' },
];

const systemLogs: SystemLog[] = [
    { id: 1, userId: 1, userName: 'Sistem Yöneticisi', action: 'Login', entityType: 'User', details: 'Sisteme giriş yapıldı', timestamp: '2026-01-29T08:00:00' },
    { id: 2, userId: 1, userName: 'Sistem Yöneticisi', action: 'Create', entityType: 'MalzemeKalemi', entityId: 10, details: 'Lenovo ThinkPad T14 Dizüstü eklendi', timestamp: '2026-01-28T14:30:00' },
    { id: 3, userId: 1, userName: 'Sistem Yöneticisi', action: 'Approve', entityType: 'Talep', entityId: 3, details: 'Cerrahi Aletler Kategorisi talebi onaylandı', timestamp: '2026-01-24T16:00:00' },
    { id: 4, userId: 2, userName: 'Demo Kullanıcı', action: 'Login', entityType: 'User', details: 'Sisteme giriş yapıldı', timestamp: '2026-01-25T10:00:00' },
    { id: 5, userId: 2, userName: 'Demo Kullanıcı', action: 'Create', entityType: 'Talep', entityId: 1, details: 'Yeni tedarikçi ekleme talebi oluşturuldu', timestamp: '2026-01-25T10:30:00' },
];

// Helper to add log
const addLog = (userId: number | undefined, userName: string, action: string, entityType: string, entityId: number | undefined, details: string) => {
    systemLogs.push({
        id: systemLogs.length > 0 ? Math.max(...systemLogs.map(l => l.id)) + 1 : 1,
        userId,
        userName,
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date().toISOString()
    });
};

// Auth Service with RBAC
export const authService = {
    login: (username: string, password: string): { success: boolean; message: string; user?: AuthUser } => {
        const user = users.find(u => u.username === username && u.isActive);
        if (!user || userPasswords[username] !== password) {
            return { success: false, message: 'Kullanıcı adı veya şifre hatalı' };
        }

        const role = roles.find(r => r.id === user.roleId);
        if (!role) {
            return { success: false, message: 'Kullanıcı rolü bulunamadı' };
        }

        const authUser: AuthUser = {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            roleId: role.id,
            roleName: role.name,
            pagePermissions: role.pagePermissions,
            entityPermissions: role.entityPermissions
        };

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(authUser));

        addLog(user.id, user.fullName, 'Login', 'User', undefined, 'Sisteme giriş yapıldı');

        return { success: true, message: 'Giriş başarılı', user: authUser };
    },
    logout: () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            addLog(currentUser.id, currentUser.fullName, 'Logout', 'User', undefined, 'Sistemden çıkış yapıldı');
        }
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
    },
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getCurrentUser: (): AuthUser | null => {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr) as AuthUser;
        } catch {
            return null;
        }
    },
    hasPagePermission: (page: string): boolean => {
        const user = authService.getCurrentUser();
        if (!user) return false;
        return user.pagePermissions.includes(page);
    },
    hasEntityPermission: (entity: string, action: string): boolean => {
        const user = authService.getCurrentUser();
        if (!user) return false;
        const perms = user.entityPermissions[entity];
        return perms ? perms.includes(action) : false;
    },
    isAdmin: (): boolean => {
        const user = authService.getCurrentUser();
        return user?.roleName === 'Admin';
    },
    refreshSession: (): AuthUser | null => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return null;

        const user = users.find(u => u.username === currentUser.username && u.isActive);
        if (!user) {
            authService.logout();
            return null;
        }

        const role = roles.find(r => r.id === user.roleId);
        if (!role) return null;

        const newAuthUser: AuthUser = {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            roleId: role.id,
            roleName: role.name,
            pagePermissions: role.pagePermissions,
            entityPermissions: role.entityPermissions
        };

        localStorage.setItem('currentUser', JSON.stringify(newAuthUser));
        return newAuthUser;
    }
};

// Users Service
export const usersService = {
    getAll: () => [...users],
    getById: (id: number) => users.find(u => u.id === id),
    create: (data: UserCreate): User => {
        const newUser: User = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            roleId: data.roleId,
            roleName: roles.find(r => r.id === data.roleId)?.name || 'Bilinmiyor',
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0]
        };
        users.push(newUser);
        userPasswords[data.username] = data.password;

        const currentUser = authService.getCurrentUser();
        addLog(currentUser?.id, currentUser?.fullName || 'Sistem', 'Create', 'User', newUser.id, `Yeni kullanıcı oluşturuldu: ${newUser.fullName}`);

        return newUser;
    },
    update: (id: number, data: UserUpdate): User | undefined => {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return undefined;

        if (data.email) users[index].email = data.email;
        if (data.fullName) users[index].fullName = data.fullName;
        if (data.roleId) {
            users[index].roleId = data.roleId;
            users[index].roleName = roles.find(r => r.id === data.roleId)?.name || 'Bilinmiyor';
        }
        if (data.isActive !== undefined) users[index].isActive = data.isActive;
        if (data.password) userPasswords[users[index].username] = data.password;

        const currentUser = authService.getCurrentUser();
        addLog(currentUser?.id, currentUser?.fullName || 'Sistem', 'Update', 'User', id, `Kullanıcı güncellendi: ${users[index].fullName}`);

        return users[index];
    },
    delete: (id: number) => {
        const index = users.findIndex(u => u.id === id);
        if (index > -1) {
            const deleted = users[index];
            users.splice(index, 1);
            delete userPasswords[deleted.username];

            const currentUser = authService.getCurrentUser();
            addLog(currentUser?.id, currentUser?.fullName || 'Sistem', 'Delete', 'User', id, `Kullanıcı silindi: ${deleted.fullName}`);
        }
    }
};

// Roles Service
export const rolesService = {
    getAll: () => [...roles],
    getById: (id: number) => roles.find(r => r.id === id),
    create: (data: RoleCreate): Role => {
        const newRole: Role = {
            id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
            ...data
        };
        roles.push(newRole);

        const currentUser = authService.getCurrentUser();
        addLog(currentUser?.id, currentUser?.fullName || 'Sistem', 'Create', 'Role', newRole.id, `Yeni rol oluşturuldu: ${newRole.name}`);

        return newRole;
    },
    update: (id: number, data: Partial<Role>): Role | undefined => {
        const index = roles.findIndex(r => r.id === id);
        if (index === -1) return undefined;

        roles[index] = { ...roles[index], ...data };

        const currentUser = authService.getCurrentUser();
        addLog(currentUser?.id, currentUser?.fullName || 'Sistem', 'Update', 'Role', id, `Rol güncellendi: ${roles[index].name}`);

        return roles[index];
    },
    delete: (id: number) => {
        if (users.some(u => u.roleId === id)) {
            throw new Error('Bu role atanmış kullanıcılar var');
        }
        const index = roles.findIndex(r => r.id === id);
        if (index > -1) {
            const deleted = roles[index];
            roles.splice(index, 1);

            const currentUser = authService.getCurrentUser();
            addLog(currentUser?.id, currentUser?.fullName || 'Sistem', 'Delete', 'Role', id, `Rol silindi: ${deleted.name}`);
        }
    },
    getAvailablePages: (): PageOption[] => [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'depolar', label: 'Depolar' },
        { key: 'malzemeler', label: 'Malzemeler' },
        { key: 'faturalar', label: 'Faturalar' },
        { key: 'cariler', label: 'Cariler' },
        { key: 'kategoriler', label: 'Kategoriler' },
        { key: 'personeller', label: 'Personeller' },
        { key: 'zimmetler', label: 'Zimmetler' },
        { key: 'kullanicilar', label: 'Kullanıcılar' },
        { key: 'roller', label: 'Rol Yönetimi' },
        { key: 'talepler', label: 'Talepler' },
        { key: 'loglar', label: 'Loglar' },
        { key: 'talep-olustur', label: 'Talep Oluştur' },
    ],
    getAvailablePermissions: (): PermissionOption[] => [
        { entity: 'cari', label: 'Cariler', actions: ['add', 'edit', 'delete'] },
        { entity: 'depo', label: 'Depolar', actions: ['add', 'edit', 'delete'] },
        { entity: 'kategori', label: 'Kategoriler', actions: ['add', 'edit', 'delete'] },
        { entity: 'kullanici', label: 'Kullanıcılar', actions: ['add', 'edit', 'delete'] },
        { entity: 'fatura', label: 'Faturalar', actions: ['add', 'edit', 'delete'] },
        { entity: 'malzeme', label: 'Malzemeler', actions: ['add', 'edit', 'delete'] },
        { entity: 'personel', label: 'Personeller', actions: ['add', 'edit', 'delete'] },
        { entity: 'zimmet', label: 'Zimmetler', actions: ['add', 'edit', 'delete'] },
        { entity: 'bolum', label: 'Bölümler', actions: ['add', 'edit', 'delete'] },
    ]
};

// Talepler Service
export const taleplerService = {
    getAll: (durum?: string) => {
        let result = [...talepler];
        if (durum) result = result.filter(t => t.durum === durum);
        return result.sort((a, b) => new Date(b.olusturmaTarihi).getTime() - new Date(a.olusturmaTarihi).getTime());
    },
    getById: (id: number) => talepler.find(t => t.id === id),
    getByUser: (userId: number) => talepler.filter(t => t.talepEdenUserId === userId).sort((a, b) => new Date(b.olusturmaTarihi).getTime() - new Date(a.olusturmaTarihi).getTime()),
    create: (data: TalepCreate): Talep => {
        const user = users.find(u => u.id === data.talepEdenUserId);
        const newTalep: Talep = {
            id: talepler.length > 0 ? Math.max(...talepler.map(t => t.id)) + 1 : 1,
            talepTipi: data.talepTipi,
            talepEdenUserId: data.talepEdenUserId,
            talepEdenUserName: user?.fullName || 'Bilinmiyor',
            baslik: data.baslik,
            detaylar: data.detaylar,
            talepData: data.talepData,
            durum: 'Beklemede',
            olusturmaTarihi: new Date().toISOString()
        };
        talepler.push(newTalep);

        addLog(data.talepEdenUserId, user?.fullName || 'Bilinmiyor', 'Create', 'Talep', newTalep.id, `Yeni talep oluşturuldu: ${newTalep.baslik}`);

        return newTalep;
    },
    onayla: (id: number, onaylayanUserId: number): Talep | undefined => {
        const talep = talepler.find(t => t.id === id);
        if (!talep || talep.durum !== 'Beklemede') return undefined;

        const approver = users.find(u => u.id === onaylayanUserId);
        talep.durum = 'Onaylandi';
        talep.onaylayanUserId = onaylayanUserId;
        talep.onaylayanUserName = approver?.fullName || 'Bilinmiyor';
        talep.onayTarihi = new Date().toISOString();

        addLog(onaylayanUserId, approver?.fullName || 'Bilinmiyor', 'Approve', 'Talep', id, `Talep onaylandı: ${talep.baslik}`);

        return talep;
    },
    reddet: (id: number, onaylayanUserId: number, redNedeni: string): Talep | undefined => {
        const talep = talepler.find(t => t.id === id);
        if (!talep || talep.durum !== 'Beklemede') return undefined;

        const approver = users.find(u => u.id === onaylayanUserId);
        talep.durum = 'Reddedildi';
        talep.onaylayanUserId = onaylayanUserId;
        talep.onaylayanUserName = approver?.fullName || 'Bilinmiyor';
        talep.onayTarihi = new Date().toISOString();
        talep.redNedeni = redNedeni;

        addLog(onaylayanUserId, approver?.fullName || 'Bilinmiyor', 'Reject', 'Talep', id, `Talep reddedildi: ${talep.baslik} - Neden: ${redNedeni}`);

        return talep;
    },
    getBekleyenSayisi: () => talepler.filter(t => t.durum === 'Beklemede').length
};

// Logs Service
export const logsService = {
    getAll: (filters?: { action?: string; entityType?: string; userId?: number }) => {
        let result = [...systemLogs];
        if (filters?.action) result = result.filter(l => l.action === filters.action);
        if (filters?.entityType) result = result.filter(l => l.entityType === filters.entityType);
        if (filters?.userId) result = result.filter(l => l.userId === filters.userId);
        return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    getActions: () => ['Login', 'Logout', 'Create', 'Update', 'Delete', 'Approve', 'Reject'],
    getEntityTypes: () => ['User', 'Role', 'Cari', 'Depo', 'Kategori', 'MalzemeKalemi', 'Personel', 'Fatura', 'Zimmet', 'Talep']
};
