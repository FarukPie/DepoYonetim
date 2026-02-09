import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X, Package, Wrench, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { urunService, depoService, kategoriService, taleplerService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Urun, Depo, Kategori } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';

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
    const canDelete = hasEntityPermission('urun', 'delete');
    const canCreateRequest = hasPagePermission('talep-olustur');

    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        marka: '',
        model: '',
        seriNumarasi: '',
        barkod: '',
        birim: 'Adet'
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

    const filteredUrunler = useMemo(() => urunler.filter((urun) => {
        const matchesSearch = urun.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
            urun.barkod?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepo = !selectedDepo || urun.depoId === parseInt(selectedDepo);
        return matchesSearch && matchesDepo;
    }), [urunler, searchTerm, selectedDepo]);

    // Stable data for DataTable - only update when modal is closed to prevent flickering
    const [stableTableData, setStableTableData] = useState<Urun[]>([]);
    useEffect(() => {
        if (!showModal && !showBakimModal) {
            setStableTableData(filteredUrunler);
        }
    }, [filteredUrunler, showModal, showBakimModal]);

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
            const currentUserStr = localStorage.getItem('currentUser');
            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { id: 1 };

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



    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            marka: '', model: '', seriNumarasi: '', barkod: '', birim: 'Adet'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const baseData = {
                ad: `${formData.marka} ${formData.model}`.trim(),
                marka: formData.marka,
                model: formData.model,
                seriNumarasi: formData.seriNumarasi,
                barkod: formData.barkod,
                birim: formData.birim as 'Adet' | 'Kg' | 'Kutu',
            };

            if (editingId) {
                // Güncelleme: Mevcut verileri koru ama sadece gerekli alanları gönder
                const currentUrun = urunler.find(u => u.id === editingId);
                const updateData = {
                    ad: `${formData.marka} ${formData.model}`.trim(),
                    marka: formData.marka,
                    model: formData.model,
                    seriNumarasi: formData.seriNumarasi,
                    barkod: formData.barkod,
                    birim: formData.birim as 'Adet' | 'Kg' | 'Kutu',
                    kategoriId: currentUrun?.kategoriId || 1,
                    depoId: currentUrun?.depoId,
                    stokMiktari: currentUrun?.stokMiktari || 1,
                    maliyet: currentUrun?.maliyet || 0,
                    kdvOrani: currentUrun?.kdvOrani || 18,
                    garantiSuresiAy: currentUrun?.garantiSuresiAy || 24,
                    bozuldugundaBakimTipi: currentUrun?.bozuldugundaBakimTipi || 'Bakim',
                    ekParcaVar: currentUrun?.ekParcaVar || false,
                    durum: currentUrun?.durum || 'Aktif'
                };
                await urunService.update(editingId, updateData);
            } else {
                // Yeni Kayıt: Varsayılan değerleri ekle
                const createData = {
                    ...baseData,
                    kategoriId: kategoriler.length > 0 ? kategoriler[0].id : 1, // Varsayılan kategori
                    depoId: selectedDepo ? parseInt(selectedDepo) : (depolar.length > 0 ? depolar[0].id : undefined),
                    stokMiktari: 1,
                    maliyet: 0,
                    kdvOrani: 18,
                    garantiSuresiAy: 24,
                    bozuldugundaBakimTipi: 'Bakim' as 'Kalibrasyon' | 'Bakim',
                    ekParcaVar: false,
                    durum: 'Pasif' as const
                };
                await urunService.create(createData);
            }

            loadData();
            closeModal();
        } catch (error) {
            console.error('Malzeme kaydedilirken hata oluştu:', error);
            alert('Malzeme kaydedilirken bir hata oluştu.');
        }
    };

    const handleEdit = (urun: Urun) => {
        setEditingId(urun.id);
        setFormData({
            marka: (urun as any).marka || urun.ad.split(' ')[0] || '',
            model: (urun as any).model || urun.ad.split(' ').slice(1).join(' ') || '',
            seriNumarasi: (urun as any).seriNumarasi || '',
            barkod: urun.barkod || '',
            birim: urun.birim
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            try {
                await urunService.delete(id);
                loadData();
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Silme sırasında bir hata oluştu.');
            }
        }
    };



    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'badge-success';
            case 'Baakimda':
            case 'Bakimda': return 'badge-warning';
            case 'TamirBekliyor': return 'badge-error';
            case 'Zimmetli': return 'badge-info';
            default: return 'badge-neutral';
        }
    };

    const getDurumText = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'Zimmetli Değil';
            case 'Bakimda': return 'Bakımda';
            case 'TamirBekliyor': return 'Tamir Bekliyor';
            case 'Zimmetli': return 'Zimmetli';
            default: return durum;
        }
    };

    const columns: Column<Urun>[] = useMemo(() => [
        {
            header: 'Marka',
            render: (urun: Urun) => urun.marka || urun.ad.split(' ')[0] || '-'
        },
        {
            header: 'Model',
            render: (urun: Urun) => urun.model || urun.ad.split(' ').slice(1).join(' ') || '-'
        },
        { header: 'Barkod Numarası', accessor: 'barkod' as keyof Urun },
        { header: 'Seri Numarası', accessor: 'seriNumarasi' as keyof Urun },
        ...((canEdit || canDelete || canCreateRequest) ? [{
            header: 'İşlemler',
            render: (urun: Urun) => (
                <div className="flex gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(urun)} title="Düzenle">
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(urun.id)} title="Sil">
                            <Trash2 size={16} />
                        </button>
                    )}
                    {canCreateRequest && (
                        <button
                            className="btn btn-outline"
                            onClick={() => openBakimModal(urun)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                            title="Bakım/Tamir Talebi Oluştur"
                        >
                            <Wrench size={14} />
                            <span className="hide-on-mobile">Talep</span>
                        </button>
                    )}
                </div>
            )
        }] : [])
    ], [canEdit, canDelete, canCreateRequest]);

    return (
        <>
            <div className="page-content">
                <DataTable
                    title="Ürünler"
                    columns={columns}
                    data={stableTableData}
                    searchable={true}
                    onSearch={(term) => setSearchTerm(term)}
                    searchPlaceholder="Ürün ara..."
                    onAdd={canAdd ? () => {
                        setEditingId(null);
                        setFormData({
                            marka: '', model: '', seriNumarasi: '', barkod: '', birim: 'Adet'
                        });
                        setShowModal(true);
                    } : undefined}
                    addButtonLabel="Malzeme Ekle"
                    emptyMessage="Hiç ürün bulunamadı."
                    extraToolbarContent={
                        <select
                            className="form-select"
                            style={{ width: '200px' }}
                            value={selectedDepo}
                            onChange={(e) => setSelectedDepo(e.target.value)}
                        >
                            <option value="">Tüm Depolar</option>
                            {depolar.map(d => (
                                <option key={d.id} value={d.id}>{d.ad}</option>
                            ))}
                        </select>
                    }
                />
            </div>

            {/* Malzeme Ekleme Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Malzeme Düzenle' : 'Malzeme Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Marka</label>
                                        <input type="text" className="form-input" required value={formData.marka}
                                            placeholder="Örn: Apple, Lenovo, HP"
                                            onChange={(e) => setFormData({ ...formData, marka: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Model</label>
                                        <input type="text" className="form-input" required value={formData.model}
                                            placeholder="Örn: MacBook Pro 14, ThinkPad X1"
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Seri Numarası</label>
                                        <input type="text" className="form-input" value={formData.seriNumarasi}
                                            placeholder="Örn: SN123456789"
                                            onChange={(e) => setFormData({ ...formData, seriNumarasi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Barkod Numarası</label>
                                        <input type="text" className="form-input" value={formData.barkod}
                                            placeholder="Örn: 8699999999999"
                                            onChange={(e) => setFormData({ ...formData, barkod: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Birim</label>
                                    <select className="form-select" value={formData.birim}
                                        onChange={(e) => setFormData({ ...formData, birim: e.target.value })}>
                                        <option value="Adet">Adet</option>
                                        <option value="Kutu">Kutu</option>
                                        <option value="Kg">Kg</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>İptal</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Güncelle' : 'Kaydet'}</button>
                            </div>
                        </form>
                    </div >
                </div >
            )
            }

            {/* Bakım/Tamir Talebi Modal */}
            {
                showBakimModal && selectedUrun && (
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
                                            <label className="form-label">Talep Tipi</label>
                                            <select className="form-select" value={bakimFormData.talepTipi}
                                                onChange={(e) => setBakimFormData({ ...bakimFormData, talepTipi: e.target.value as 'Bakim' | 'Tamir' })}>
                                                <option value="Bakim">Bakım / Kalibrasyon</option>
                                                <option value="Tamir">Arıza / Tamir</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Öncelik</label>
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
                                            <label className="form-label">Talep Tarihi</label>
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
                                        <label className="form-label">Hata / Arıza Tanımı</label>
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
                )
            }
        </>
    );
}
