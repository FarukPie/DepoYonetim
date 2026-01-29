import { useState, useEffect } from 'react';
import { Plus, X, Search, Package, Wrench, AlertTriangle } from 'lucide-react';
import { urunService, depoService, kategoriService, taleplerService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Urun, Depo, Kategori } from '../types';

export default function Urunler() {
    const { hasEntityPermission, hasPagePermission } = useAuth();
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [depolar, setDepolar] = useState<Depo[]>([]);
    const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepo, setSelectedDepo] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showBakimModal, setShowBakimModal] = useState(false);
    const [selectedUrun, setSelectedUrun] = useState<Urun | null>(null);

    const canAdd = hasEntityPermission('urun', 'add');
    const canEdit = hasEntityPermission('urun', 'edit');
    const canCreateRequest = hasPagePermission('talep-olustur');
    const [formData, setFormData] = useState({
        ad: '', barkod: '', kategoriId: '', depoId: '', birim: 'Adet',
        maliyet: '', kdvOrani: '18', garantiSuresiAy: '12', stokMiktari: '',
        bozuldugundaBakimTipi: 'Bakim', ekParcaVar: false,
    });

    const [bakimFormData, setBakimFormData] = useState({
        talepTipi: 'Bakim' as 'Bakim' | 'Tamir',
        hataTanimi: '',
        detaylar: '',
        talepTarihi: new Date().toISOString().split('T')[0],
        oncelik: 'Normal' as 'Dusuk' | 'Normal' | 'Yuksek' | 'Acil',
        olusturanKisi: 'Admin',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [urunlerData, depolarData, kategorilerData] = await Promise.all([
                urunService.getAll(),
                depoService.getAll(),
                kategoriService.getAll()
            ]);
            setUrunler(urunlerData);
            setDepolar(depolarData);
            setKategoriler(kategorilerData);
        } catch (error) {
            console.error('Veri yüklenirken hata oluştu:', error);
        }
    };

    const filteredUrunler = urunler.filter((urun) => {
        const matchesSearch = urun.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
            urun.barkod?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepo = !selectedDepo || urun.depoId === parseInt(selectedDepo);
        return matchesSearch && matchesDepo;
    });

    const openBakimModal = (urun: Urun) => {
        setSelectedUrun(urun);
        setBakimFormData({
            talepTipi: 'Bakim',
            hataTanimi: '',
            detaylar: '',
            talepTarihi: new Date().toISOString().split('T')[0],
            oncelik: 'Normal',
            olusturanKisi: 'Admin',
        });
        setShowBakimModal(true);
    };

    const handleBakimSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUrun) return;

        try {
            // Get current user (mock ID for now if not logged in truly)
            const currentUserStr = localStorage.getItem('currentUser');
            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { id: 1 }; // Default to ID 1 if null

            await taleplerService.create({
                talepTipi: bakimFormData.talepTipi,
                talepEdenUserId: currentUser.id,
                baslik: `${selectedUrun.ad} - ${bakimFormData.talepTipi} Talebi`,
                detaylar: bakimFormData.hataTanimi,
                talepData: JSON.stringify({
                    urunId: selectedUrun.id,
                    urunAdi: selectedUrun.ad,
                    oncelik: bakimFormData.oncelik,
                    detaylar: bakimFormData.detaylar,
                    talepTarihi: bakimFormData.talepTarihi
                })
            });

            loadData();
            setShowBakimModal(false);
            alert(`${bakimFormData.talepTipi === 'Tamir' ? 'Tamir' : 'Bakım'} talebi başarıyla oluşturuldu!`);
        } catch (error) {
            console.error('Talep oluşturulurken hata:', error);
            alert('Talep oluşturulurken bir hata meydana geldi.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const kategori = kategoriler.find(k => k.id === parseInt(formData.kategoriId));
        const depo = depolar.find(d => d.id === parseInt(formData.depoId));

        try {
            await urunService.create({
                ad: formData.ad,
                barkod: formData.barkod,
                kategoriId: parseInt(formData.kategoriId),
                kategoriAdi: kategori?.ad,
                depoId: parseInt(formData.depoId),
                depoAdi: depo?.ad,
                birim: formData.birim as 'Adet' | 'Kg' | 'Kutu',
                maliyet: parseFloat(formData.maliyet),
                kdvOrani: parseInt(formData.kdvOrani),
                garantiSuresiAy: parseInt(formData.garantiSuresiAy),
                stokMiktari: parseInt(formData.stokMiktari),
                bozuldugundaBakimTipi: formData.bozuldugundaBakimTipi as 'Kalibrasyon' | 'Bakim',
                ekParcaVar: formData.ekParcaVar,
                durum: 'Aktif',
            });

            loadData();
            setShowModal(false);
            setFormData({
                ad: '', barkod: '', kategoriId: '', depoId: '', birim: 'Adet',
                maliyet: '', kdvOrani: '18', garantiSuresiAy: '12', stokMiktari: '',
                bozuldugundaBakimTipi: 'Bakim', ekParcaVar: false,
            });
        } catch (error) {
            console.error('Ürün eklenirken hata oluştu:', error);
            alert('Ürün eklenirken bir hata oluştu.');
        }

        loadData();
        setShowModal(false);
        setFormData({
            ad: '', barkod: '', kategoriId: '', depoId: '', birim: 'Adet',
            maliyet: '', kdvOrani: '18', garantiSuresiAy: '12', stokMiktari: '',
            bozuldugundaBakimTipi: 'Bakim', ekParcaVar: false,
        });
    };

    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'badge-success';
            case 'Bakimda': return 'badge-warning';
            case 'TamirBekliyor': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const getDurumText = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'Aktif';
            case 'Bakimda': return 'Bakımda';
            case 'TamirBekliyor': return 'Tamir Bekliyor';
            default: return durum;
        }
    };

    return (
        <>
            <header className="page-header">
                <h1>Ürünler</h1>
                <p>Envanterdeki tüm ürünleri yönetin</p>
            </header>

            <div className="page-content">
                <div className="toolbar">
                    <div className="search-box">
                        <Search />
                        <input type="text" placeholder="Ürün ara..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <select className="form-select" style={{ width: '200px' }} value={selectedDepo}
                            onChange={(e) => setSelectedDepo(e.target.value)}>
                            <option value="">Tüm Depolar</option>
                            {depolar.map(d => (
                                <option key={d.id} value={d.id}>{d.ad}</option>
                            ))}
                        </select>
                    </div>
                    {canAdd && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Yeni Ürün Ekle
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ürün Adı</th>
                                <th>Kategori</th>
                                <th>Depo</th>
                                <th>Stok</th>
                                <th>Maliyet</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUrunler.map((urun) => (
                                <tr key={urun.id}>
                                    <td>
                                        <div className="flex items-center gap-md">
                                            <div style={{ width: '36px', height: '36px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{urun.ad}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{urun.barkod}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{urun.kategoriAdi}</td>
                                    <td>{urun.depoAdi}</td>
                                    <td>{urun.stokMiktari} {urun.birim}</td>
                                    <td>{urun.maliyet?.toLocaleString('tr-TR')} ₺</td>
                                    <td><span className={`badge ${getDurumBadge(urun.durum)}`}>{getDurumText(urun.durum)}</span></td>
                                    <td>
                                        {(canEdit || canCreateRequest) && (
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => openBakimModal(urun)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <Wrench size={16} />
                                                Bakım/Tamir
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ürün Ekleme Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Yeni Ürün Ekle</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Ürün Adı *</label>
                                        <input type="text" className="form-input" required value={formData.ad}
                                            onChange={(e) => setFormData({ ...formData, ad: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Barkod</label>
                                        <input type="text" className="form-input" value={formData.barkod}
                                            onChange={(e) => setFormData({ ...formData, barkod: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Kategori *</label>
                                        <select className="form-select" required value={formData.kategoriId}
                                            onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value })}>
                                            <option value="">Seçiniz</option>
                                            {kategoriler.filter(k => k.ustKategoriId).map(k => (
                                                <option key={k.id} value={k.id}>{k.ustKategoriAdi} / {k.ad}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Depo *</label>
                                        <select className="form-select" required value={formData.depoId}
                                            onChange={(e) => setFormData({ ...formData, depoId: e.target.value })}>
                                            <option value="">Seçiniz</option>
                                            {depolar.filter(d => d.aktif).map(d => (
                                                <option key={d.id} value={d.id}>{d.ad}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Maliyet (₺) *</label>
                                        <input type="number" className="form-input" required value={formData.maliyet}
                                            onChange={(e) => setFormData({ ...formData, maliyet: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stok Miktarı *</label>
                                        <input type="number" className="form-input" required value={formData.stokMiktari}
                                            onChange={(e) => setFormData({ ...formData, stokMiktari: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">KDV Oranı (%)</label>
                                        <select className="form-select" value={formData.kdvOrani}
                                            onChange={(e) => setFormData({ ...formData, kdvOrani: e.target.value })}>
                                            <option value="0">%0</option>
                                            <option value="1">%1</option>
                                            <option value="10">%10</option>
                                            <option value="18">%18</option>
                                            <option value="20">%20</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Garanti Süresi (Ay)</label>
                                        <input type="number" className="form-input" value={formData.garantiSuresiAy}
                                            onChange={(e) => setFormData({ ...formData, garantiSuresiAy: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bozulduğunda Bakım Tipi</label>
                                    <select className="form-select" value={formData.bozuldugundaBakimTipi}
                                        onChange={(e) => setFormData({ ...formData, bozuldugundaBakimTipi: e.target.value })}>
                                        <option value="Bakim">Bakım</option>
                                        <option value="Kalibrasyon">Kalibrasyon</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input type="checkbox" checked={formData.ekParcaVar}
                                            onChange={(e) => setFormData({ ...formData, ekParcaVar: e.target.checked })} />
                                        <span>Ek parça/aksesuar içerir</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bakım/Tamir Talebi Modal */}
            {showBakimModal && selectedUrun && (
                <div className="modal-overlay" onClick={() => setShowBakimModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <div className="flex items-center gap-md">
                                    <AlertTriangle size={24} style={{ color: 'var(--accent-warning)' }} />
                                    Bakım / Tamir Talebi
                                </div>
                            </h2>
                            <button className="modal-close" onClick={() => setShowBakimModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleBakimSubmit}>
                            <div className="modal-body">
                                {/* Ürün Bilgisi */}
                                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', background: 'var(--bg-tertiary)' }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{selectedUrun.ad}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {selectedUrun.kategoriAdi} • {selectedUrun.depoAdi}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Talep Tipi *</label>
                                        <select className="form-select" value={bakimFormData.talepTipi}
                                            onChange={(e) => setBakimFormData({ ...bakimFormData, talepTipi: e.target.value as 'Bakim' | 'Tamir' })}>
                                            <option value="Bakim">Bakım / Kalibrasyon</option>
                                            <option value="Tamir">Arıza / Tamir</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Öncelik *</label>
                                        <select className="form-select" value={bakimFormData.oncelik}
                                            onChange={(e) => setBakimFormData({ ...bakimFormData, oncelik: e.target.value as any })}>
                                            <option value="Dusuk">Düşük</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Yuksek">Yüksek</option>
                                            <option value="Acil">Acil</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Talep Tarihi *</label>
                                        <input type="date" className="form-input" required value={bakimFormData.talepTarihi}
                                            onChange={(e) => setBakimFormData({ ...bakimFormData, talepTarihi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Talep Eden</label>
                                        <input type="text" className="form-input" value={bakimFormData.olusturanKisi}
                                            onChange={(e) => setBakimFormData({ ...bakimFormData, olusturanKisi: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Hata / Arıza Tanımı *</label>
                                    <input type="text" className="form-input" required placeholder="Örn: Cihaz açılmıyor, ekran kararmış..."
                                        value={bakimFormData.hataTanimi}
                                        onChange={(e) => setBakimFormData({ ...bakimFormData, hataTanimi: e.target.value })} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Detaylar</label>
                                    <textarea className="form-textarea" rows={4}
                                        placeholder="Arızanın ne zaman başladığı, nasıl fark edildiği, daha önce müdahale edilip edilmediği gibi detayları yazın..."
                                        value={bakimFormData.detaylar}
                                        onChange={(e) => setBakimFormData({ ...bakimFormData, detaylar: e.target.value })} />
                                </div>

                                {bakimFormData.talepTipi === 'Tamir' && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-error)', fontSize: '0.875rem' }}>
                                            <AlertTriangle size={16} />
                                            <span>Bu talep oluşturulduğunda ürün durumu "Tamir Bekliyor" olarak güncellenecektir.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBakimModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">
                                    <Wrench size={16} />
                                    Talep Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
