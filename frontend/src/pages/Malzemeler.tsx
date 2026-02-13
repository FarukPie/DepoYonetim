import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Package, Wrench, AlertTriangle, Edit, Trash2, Check, Info } from 'lucide-react';
import { malzemeKalemiService, taleplerService, kategoriService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MalzemeKalemi, Kategori } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Malzemeler() {
    const { hasEntityPermission, hasPagePermission } = useAuth();
    const [malzemeler, setMalzemeler] = useState<MalzemeKalemi[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Category State
    const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
    const [filterKategoriId, setFilterKategoriId] = useState<number | undefined>(undefined);

    const [showModal, setShowModal] = useState(false);
    const [showBakimModal, setShowBakimModal] = useState(false);
    const [selectedMalzeme, setSelectedMalzeme] = useState<MalzemeKalemi | null>(null);

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailMalzeme, setSelectedDetailMalzeme] = useState<MalzemeKalemi | null>(null);

    const canAdd = hasEntityPermission('malzeme', 'add'); // Updated permission key
    const canEdit = hasEntityPermission('malzeme', 'edit');
    const canDelete = hasEntityPermission('malzeme', 'delete');
    const canCreateRequest = hasPagePermission('talep-olustur');

    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        ad: '',
        dmbNo: '',
        ekParcaVar: false,
        parcaAd: '',
        birim: 'Adet',
        rutin: '',
        aciklama: '',
        state: 0, // 0=Aktif
        kategoriId: undefined as number | undefined
    });

    const [bakimFormData, setBakimFormData] = useState({
        talepTipi: 'Bakim' as 'Bakim' | 'Tamir',
        hataTanimi: '',
        detaylar: '',
        talepTarihi: new Date().toISOString().split('T')[0],
        oncelik: 'Normal' as 'Dusuk' | 'Normal' | 'Yuksek' | 'Acil',
        olusturanKisi: 'Admin',
    });

    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showBakimConfirm, setShowBakimConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    useEffect(() => {
        fetchKategoriler();
    }, []);

    useEffect(() => {
        loadData(page, pageSize, searchTerm);
    }, [page, pageSize, filterKategoriId]); // Trigger load on pagination or filter change

    const fetchKategoriler = async () => {
        try {
            const data = await kategoriService.getAll();
            setKategoriler(data);
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    };

    const loadData = async (currentPage: number, currentPageSize: number, search: string) => {
        setIsLoading(true);
        try {
            const result = await malzemeKalemiService.getPaged(currentPage, currentPageSize, search, filterKategoriId);
            setMalzemeler(result.items);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error('Veri yüklenirken hata oluştu:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1); // Reset to first page on new search
        loadData(1, pageSize, term);
    };

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
    };

    const openBakimModal = (malzeme: MalzemeKalemi) => {
        setSelectedMalzeme(malzeme);
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
        setShowBakimConfirm(true);
    };

    const confirmBakimSubmit = async () => {
        if (!selectedMalzeme) return;

        try {
            const currentUserStr = localStorage.getItem('currentUser');
            const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { id: 1 };

            await taleplerService.create({
                talepTipi: bakimFormData.talepTipi,
                talepEdenUserId: currentUser.id,
                baslik: `${selectedMalzeme.ad} - ${bakimFormData.talepTipi} Talebi`,
                detaylar: bakimFormData.hataTanimi,
                talepData: JSON.stringify({
                    malzemeId: selectedMalzeme.id,
                    malzemeAdi: selectedMalzeme.ad,
                    oncelik: bakimFormData.oncelik,
                    detaylar: bakimFormData.detaylar,
                    talepTarihi: bakimFormData.talepTarihi
                })
            });

            loadData(page, pageSize, searchTerm);
            setShowBakimModal(false);
            setShowBakimConfirm(false);
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
            ad: '', dmbNo: '', ekParcaVar: false, parcaAd: '', birim: 'Adet', rutin: '', aciklama: '', state: 0, kategoriId: undefined
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            if (editingId) {
                await malzemeKalemiService.update(editingId, formData);
            } else {
                await malzemeKalemiService.create(formData);
            }

            loadData(page, pageSize, searchTerm);
            closeModal();
            setShowSaveConfirm(false);
        } catch (error: any) {
            console.error('Malzeme kaydedilirken hata oluştu:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Malzeme kaydedilirken bir hata oluştu.';
            const errorDetails = error.response?.data?.details || '';
            alert(`${errorMessage}\n${errorDetails}`);
        }
    };

    const handleEdit = (malzeme: MalzemeKalemi) => {
        setEditingId(malzeme.id);
        setFormData({
            ad: malzeme.ad,
            dmbNo: malzeme.dmbNo || '',
            ekParcaVar: malzeme.ekParcaVar,
            parcaAd: malzeme.parcaAd || '',
            birim: malzeme.birim,
            rutin: malzeme.rutin || '',
            aciklama: malzeme.aciklama || '',
            state: malzeme.state,
            kategoriId: malzeme.kategoriId
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await malzemeKalemiService.delete(deleteTargetId);
            loadData(page, pageSize, searchTerm);
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    const getDurumBadge = (state: number) => {
        switch (state) {
            case 0: return 'badge-success'; // Aktif
            case 1: return 'badge-warning'; // Bakimda
            case 2: return 'badge-error';   // TamirBekliyor
            case 3: return 'badge-neutral'; // Hurda
            case 4: return 'badge-info';    // Zimmetli
            case 5: return 'badge-neutral'; // Pasif
            default: return 'badge-neutral';
        }
    };

    const getDurumText = (state: number) => {
        switch (state) {
            case 0: return 'Aktif';
            case 1: return 'Bakımda';
            case 2: return 'Tamir Bekliyor';
            case 3: return 'Hurda';
            case 4: return 'Zimmetli';
            case 5: return 'Pasif';
            default: return 'Bilinmiyor';
        }
    };

    const handleRowClick = (malzeme: MalzemeKalemi) => {
        setSelectedDetailMalzeme(malzeme);
        setShowDetailModal(true);
    };

    const columns: Column<MalzemeKalemi>[] = useMemo(() => [
        { header: 'Malzeme Adı', accessor: 'ad' as keyof MalzemeKalemi },
        { header: 'Kategori', render: (m: MalzemeKalemi) => m.kategoriAdi || '—' },
        { header: 'DMB No', accessor: 'dmbNo' as keyof MalzemeKalemi },
        { header: 'Rutin', accessor: 'rutin' as keyof MalzemeKalemi },
        { header: 'Ek Parça', render: (m: MalzemeKalemi) => m.parcaAd || '—' },
        {
            header: 'Durum',
            render: (m: MalzemeKalemi) => (
                <span className={`badge ${getDurumBadge(m.state)}`}>
                    {getDurumText(m.state)}
                </span>
            )
        },
        ...((canEdit || canDelete || canCreateRequest) ? [{
            header: 'İşlemler',
            render: (m: MalzemeKalemi) => (
                <div className="flex gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(m)} title="Düzenle">
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(m.id)} title="Sil">
                            <Trash2 size={16} />
                        </button>
                    )}
                    {canCreateRequest && (
                        <button
                            className="btn btn-outline"
                            onClick={() => openBakimModal(m)}
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
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        className="form-select"
                        style={{ maxWidth: '200px' }}
                        value={filterKategoriId || ''}
                        onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            setFilterKategoriId(val);
                            setPage(1); // Reset to first page
                        }}
                    >
                        <option value="">Tüm Kategoriler</option>
                        {kategoriler.map(k => (
                            <option key={k.id} value={k.id}>{k.ad}</option>
                        ))}
                    </select>
                </div>
                <DataTable
                    title="Malzeme Kartı"
                    columns={columns}
                    data={malzemeler}
                    searchable={true}
                    onSearch={handleSearch}
                    searchPlaceholder="Malzeme veya DMB No ara..."
                    onAdd={canAdd ? () => {
                        setEditingId(null);
                        setFormData({
                            ad: '', dmbNo: '', ekParcaVar: false, parcaAd: '', birim: 'Adet', rutin: '', aciklama: '', state: 0, kategoriId: undefined
                        });
                        setShowModal(true);
                    } : undefined}
                    addButtonLabel="Malzeme Ekle"
                    emptyMessage="Hiç malzeme bulunamadı."
                    onRowClick={handleRowClick}
                    rowClickable={true}
                    serverSide={true}
                    totalCount={totalCount}
                    paginationParams={{ pageNumber: page, pageSize }}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            </div>

            {/* Malzeme Ekleme/Düzenleme Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Malzeme Düzenle' : 'Malzeme Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Malzeme Adı</label>
                                    <input type="text" className="form-input" required value={formData.ad}
                                        placeholder="Örn: Philips MX800 Hasta Monitörü"
                                        onChange={(e) => setFormData({ ...formData, ad: e.target.value })} />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">DMB No</label>
                                        <input type="text" className="form-input" value={formData.dmbNo}
                                            placeholder="Demirbaş Numarası"
                                            onChange={(e) => setFormData({ ...formData, dmbNo: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Kategori</label>
                                        <select className="form-select" value={formData.kategoriId || ''}
                                            onChange={(e) => setFormData({ ...formData, kategoriId: e.target.value ? Number(e.target.value) : undefined })}>
                                            <option value="">Kategori Seçiniz</option>
                                            {kategoriler.map(k => (
                                                <option key={k.id} value={k.id}>{k.ad}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Birim</label>
                                        <select className="form-select" value={formData.birim}
                                            onChange={(e) => setFormData({ ...formData, birim: e.target.value })}>
                                            <option value="Adet">Adet</option>
                                            <option value="Kutu">Kutu</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Set">Set</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="flex items-center gap-sm cursor-pointer">
                                        <input type="checkbox" checked={formData.ekParcaVar}
                                            onChange={(e) => setFormData({ ...formData, ekParcaVar: e.target.checked, parcaAd: e.target.checked ? formData.parcaAd : '' })} />
                                        <span>Ek Parçası Var</span>
                                    </label>
                                </div>
                                {formData.ekParcaVar && (
                                    <div className="form-group">
                                        <label className="form-label">Ek Parça Adı</label>
                                        <input type="text" className="form-input" value={formData.parcaAd}
                                            placeholder="Ek parça adını giriniz..."
                                            onChange={(e) => setFormData({ ...formData, parcaAd: e.target.value })} />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Rutin</label>
                                    <select className="form-select" value={formData.rutin}
                                        onChange={(e) => setFormData({ ...formData, rutin: e.target.value })}>
                                        <option value="">Seçiniz...</option>
                                        <option value="Bakım">Bakım</option>
                                        <option value="Kalibrasyon">Kalibrasyon</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={3}
                                        value={formData.aciklama}
                                        onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
                                </div>
                                {editingId && (
                                    <div className="form-group">
                                        <label className="form-label">Durum</label>
                                        <select className="form-select" value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: parseInt(e.target.value) })}>
                                            <option value={0}>Aktif</option>
                                            <option value={1}>Bakımda</option>
                                            <option value={2}>Tamir Bekliyor</option>
                                            <option value={3}>Hurda</option>
                                            <option value={4}>Zimmetli</option>
                                            <option value={5}>Pasif</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>İptal</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Güncelle' : 'Kaydet'}</button>
                            </div>
                        </form>
                    </div >
                </div >
            )}

            {/* Bakım/Tamir Talebi Modal */}
            {showBakimModal && selectedMalzeme && (
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
                                {/* Malzeme Bilgisi */}
                                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', background: 'var(--bg-tertiary)' }}>
                                    <div className="flex items-center gap-md">
                                        <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{selectedMalzeme.ad}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {selectedMalzeme.dmbNo}
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

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message={editingId ? 'Bu malzemeyi güncellemek istediğinize emin misiniz?' : 'Yeni malzemeyi kaydetmek istediğinize emin misiniz?'}
                confirmText={editingId ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />
            {/* Bakim Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showBakimConfirm}
                title="Talep Onayı"
                message="Bakım/Tamir talebini oluşturmak istediğinize emin misiniz?"
                confirmText="Oluştur"
                cancelText="İptal"
                onConfirm={confirmBakimSubmit}
                onCancel={() => setShowBakimConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu malzemeyi silmek istediğinize emin misiniz?"
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="info"
            />

            {/* Detay Modalı */}
            {showDetailModal && selectedDetailMalzeme && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <div className="flex items-center gap-md">
                                    <Info size={24} className="text-primary" />
                                    Malzeme Detayı
                                </div>
                            </h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', background: 'var(--bg-tertiary)' }}>
                                <div className="flex items-center gap-md">
                                    <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)' }}>
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{selectedDetailMalzeme.ad}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {selectedDetailMalzeme.dmbNo || 'DMB No Yok'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label text-muted">Birim</label>
                                    <div className="form-text-display">{selectedDetailMalzeme.birim}</div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-muted">Durum</label>
                                    <div>
                                        <span className={`badge ${getDurumBadge(selectedDetailMalzeme.state)}`}>
                                            {getDurumText(selectedDetailMalzeme.state)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label text-muted">Rutin</label>
                                    <div className="form-text-display">{selectedDetailMalzeme.rutin || '—'}</div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-muted">Ek Parça</label>
                                    <div className="form-text-display">
                                        {selectedDetailMalzeme.ekParcaVar ? (
                                            <span className="flex items-center gap-xs">
                                                <Check size={16} className="text-success" />
                                                {selectedDetailMalzeme.parcaAd || 'İsimsiz Parça'}
                                            </span>
                                        ) : (
                                            <span className="text-muted">Yok</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedDetailMalzeme.aciklama && (
                                <div className="form-group">
                                    <label className="form-label text-muted">Açıklama</label>
                                    <div className="form-text-display" style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedDetailMalzeme.aciklama}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => setShowDetailModal(false)}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
