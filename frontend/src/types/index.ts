// ===== ENUMS =====
export type Birim = 'Adet' | 'Kg' | 'Kutu';
export type BakimTipi = 'Kalibrasyon' | 'Bakim';
export type CariTipi = 'Tedarikci' | 'Musteri';
export type ZimmetDurum = 'Aktif' | 'Iade' | 'Kayip';
export type UrunDurum = 'Aktif' | 'Bakimda' | 'TamirBekliyor' | 'Hurda' | 'Zimmetli' | 'Pasif';

// ===== DEPO =====
export interface Depo {
  id: number;
  ad: string;
  aciklama?: string;
  sorumluPersonelId?: number;
  sorumluPersonelAdi?: string;
  aktif: boolean;
  urunSayisi: number;
}

export interface DepoCreate {
  ad: string;
  aciklama?: string;
  sorumluPersonelId?: number;
  aktif: boolean;
}

// ===== URUN =====
export interface Urun {
  id: number;
  ad: string;
  barkod?: string;
  kategoriId: number;
  kategoriAdi?: string;
  depoId?: number;
  depoAdi?: string;
  ekParcaVar: boolean;
  birim: Birim;
  maliyet: number;
  kdvOrani: number;
  garantiSuresiAy: number;
  bozuldugundaBakimTipi: BakimTipi;
  stokMiktari: number;
  durum: UrunDurum;
  marka?: string;
  model?: string;
  seriNumarasi?: string;
}

export interface UrunCreate {
  ad: string;
  marka?: string;
  model?: string;
  seriNumarasi?: string;
  barkod?: string;
  kategoriId: number;
  depoId?: number;
  ekParcaVar: boolean;
  birim: string;
  maliyet: number;
  kdvOrani: number;
  garantiSuresiAy: number;
  bozuldugundaBakimTipi: string;
  stokMiktari: number;
}

// ===== KATEGORI =====
export interface Kategori {
  id: number;
  ad: string;
  aciklama?: string;
  ustKategoriId?: number;
  ustKategoriAdi?: string;
  altKategoriSayisi: number;
  urunSayisi: number;
}

export interface KategoriCreate {
  ad: string;
  aciklama?: string;
  ustKategoriId?: number;
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
  subCategories: Category[];
  productCount: number;
}

// ===== PERSONEL =====
export interface Personel {
  id: number;
  ad: string;
  soyad: string;
  tamAd: string;
  tcNo?: string;
  departman?: string;
  unvan?: string;
  telefon?: string;
  email?: string;
  iseGirisTarihi?: string;
  aktif: boolean;
  zimmetSayisi: number;
}

export interface PersonelCreate {
  ad: string;
  soyad: string;
  tcNo?: string;
  departman?: string;
  unvan?: string;
  telefon?: string;
  email?: string;
  iseGirisTarihi?: string;
}

// ===== CARI =====
export interface Cari {
  id: number;
  firmaAdi: string;
  tip: CariTipi;
  ticaretSicilNo?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  telefon?: string;
  fax?: string;
  email?: string;
  webSitesi?: string;
  yetkiliKisi?: string;
  yetkiliTelefon?: string;
  bankaAdi?: string;
  ibanNo?: string;
  aktif: boolean;
}

export interface CariCreate {
  firmaAdi: string;
  tip: string;
  ticaretSicilNo?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  telefon?: string;
  fax?: string;
  email?: string;
  webSitesi?: string;
  yetkiliKisi?: string;
  yetkiliTelefon?: string;
  bankaAdi?: string;
  ibanNo?: string;
}

// ===== FATURA =====
export interface Fatura {
  id: number;
  faturaNo: string;
  cariId: number;
  cariAdi: string;
  faturaTarihi: string;
  araToplam: number;
  toplamIndirim: number;
  toplamKdv: number;
  genelToplam: number;
  aciklama?: string;
  kalemler: FaturaKalemi[];
}

export interface FaturaKalemi {
  id: number;
  urunId?: number;
  urunAdi: string;
  miktar: number;
  birimFiyat: number;
  indirimOrani: number;
  kdvOrani: number;
  toplam: number;
}

export interface FaturaCreate {
  faturaNo: string;
  cariId: number;
  faturaTarihi: string;
  aciklama?: string;
  kalemler: FaturaKalemiCreate[];
}

export interface FaturaKalemiCreate {
  urunId?: number;
  urunAdi: string;
  miktar: number;
  birimFiyat: number;
  indirimOrani: number;
  kdvOrani: number;
}

// ===== ZIMMET =====
export interface Zimmet {
  id: number;
  urunId: number;
  urunAdi: string;
  personelId?: number;
  personelAdi?: string;
  bolumId?: number;
  bolumAdi?: string;
  zimmetTarihi: string;
  iadeTarihi?: string;
  durum: ZimmetDurum;
  aciklama?: string;
}

export interface ZimmetCreate {
  urunId: number;
  personelId?: number;
  bolumId?: number;
  zimmetTarihi: string;
  aciklama?: string;
}

export interface ZimmetUpdate {
  urunId: number;
  personelId?: number;
  bolumId?: number;
  zimmetTarihi: string;
  durum: string;
  aciklama?: string;
}

// ===== DASHBOARD =====
export interface Dashboard {
  zimmetliCalisanSayisi: number;
  toplamStok: number;
  toplamKategori: number;
  bakimdakiUrunSayisi: number;
  tamirBekleyenSayisi: number;
  sonZimmetler: Zimmet[];
  tamirBekleyenUrunler: Urun[];
  onaylananTalepler: Talep[];
  bakimdakiUrunler: Urun[];
}

// ===== AUTH =====
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  pagePermissions: string[];
  entityPermissions: Record<string, string[]>;
}

// ===== USER =====
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserCreate {
  username: string;
  password: string;
  email: string;
  fullName: string;
  roleId: number;
}

export interface UserUpdate {
  email?: string;
  fullName?: string;
  roleId?: number;
  isActive?: boolean;
  password?: string;
}

// ===== ROLE =====
export interface Role {
  id: number;
  name: string;
  description: string;
  pagePermissions: string[];
  entityPermissions: Record<string, string[]>;
}

export interface RoleCreate {
  name: string;
  description: string;
  pagePermissions: string[];
  entityPermissions: Record<string, string[]>;
}

export interface PageOption {
  key: string;
  label: string;
}

export interface PermissionOption {
  entity: string;
  label: string;
  actions: string[];
}

// ===== TALEP =====
export type TalepDurum = 'Beklemede' | 'Onaylandi' | 'Reddedildi';
export type TalepTipi = 'CariEkleme' | 'CariDuzenleme' | 'CariSilme' | 'DepoEkleme' | 'DepoDuzenleme' | 'DepoSilme' | 'KategoriEkleme' | 'KategoriDuzenleme' | 'KategoriSilme' | 'Bakim' | 'Tamir';

export interface Talep {
  id: number;
  talepTipi: TalepTipi;
  talepEdenUserId: number;
  talepEdenUserName: string;
  baslik: string;
  detaylar: string;
  talepData: string;
  durum: TalepDurum;
  onaylayanUserId?: number;
  onaylayanUserName?: string;
  onayTarihi?: string;
  redNedeni?: string;
  olusturmaTarihi: string;
}

export interface TalepCreate {
  talepTipi: TalepTipi;
  talepEdenUserId: number;
  baslik: string;
  detaylar: string;
  talepData: string;
}

// ===== SYSTEM LOG =====
export interface SystemLog {
  id: number;
  userId?: number;
  userName: string;
  action: string;
  entityType: string;
  entityId?: number;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// ===== LOCATION (BOLUM) =====
export type LocationType = 'Bina' | 'Kat' | 'Koridor' | 'Oda' | 'Depo';

export interface Location {
  id: number;
  name: string;
  code: string;
  type: string;
  parentId?: number;
  subLocations?: Location[];
  description?: string;
}
