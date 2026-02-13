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

// ===== MALZEME KALEMI (Eski Urun) =====
export interface MalzemeKalemi {
  id: number;
  ad: string;
  dmbNo?: string;
  ekParcaVar: boolean;
  parcaAd?: string;
  birim: string; // Enum string values
  rutin?: string;
  aciklama?: string;
  state: number; // 0=Aktif, 1=Bakimda, 2=TamirBekliyor, 3=Hurda, 4=Zimmetli, 5=Pasif
  kategoriId?: number;
  kategoriAdi?: string;
}

export interface MalzemeKalemiCreate {
  ad: string;
  dmbNo?: string;
  ekParcaVar: boolean;
  parcaAd?: string;
  birim: string;
  rutin?: string;
  aciklama?: string;
  state: number;
  kategoriId?: number;
}

// ===== KATEGORI =====
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
  email?: string;
  yetkiliKisi?: string;
  yetkiliTelefon?: string;
  hastaneKod?: string;
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
  email?: string;
  yetkiliKisi?: string;
  yetkiliTelefon?: string;
  hastaneKod?: string;
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
  malzemeKalemiId?: number;
  malzemeAdi: string;
  miktar: number;
  birimFiyat: number;
  indirimOrani: number;
  kdvOrani: number;
  toplam: number;
  zimmetDurum: boolean;
  seriNumarasi?: string;
  barkod?: string;
}

export interface FaturaCreate {
  faturaNo: string;
  cariId: number;
  faturaTarihi: string;
  aciklama?: string;
  kalemler: FaturaKalemiCreate[];
}

export interface FaturaKalemiCreate {
  malzemeKalemiId?: number;
  malzemeAdi: string;
  miktar: number;
  birimFiyat: number;
  indirimOrani: number;
  kdvOrani: number;
  zimmetDurum: boolean;
  seriNumarasi?: string;
  barkod?: string;
}

// ===== ZIMMET =====
export interface Zimmet {
  id: number;
  faturaKalemiId: number;
  malzemeAdi: string;
  seriNumarasi?: string;
  barkod?: string;
  personelId?: number;
  personelAdi?: string;
  personelDepartman?: string;
  bolumId?: number;
  bolumAdi?: string;
  zimmetTarihi: string;
  iadeTarihi?: string;
  durum: ZimmetDurum;
  aciklama?: string;
}

export interface ZimmetCreate {
  faturaKalemiId: number;
  personelId?: number;
  bolumId?: number;
  zimmetTarihi: string;
  aciklama?: string;
}

export interface ZimmetUpdate {
  faturaKalemiId: number;
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
  tamirBekleyenMalzemeler: MalzemeKalemi[];
  onaylananTalepler: Talep[];
  bakimdakiMalzemeler: MalzemeKalemi[];
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
