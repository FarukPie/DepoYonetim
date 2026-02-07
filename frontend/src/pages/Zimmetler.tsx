import { useEffect, useState, useMemo } from 'react';
import { ClipboardList, CheckCircle, RotateCcw, Edit, Trash2, X, AlertTriangle, Search, Plus } from 'lucide-react';
import { zimmetService, urunService, personelService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zimmet } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Zimmetler() {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [zimmetler, setZimmetler] = useState<Zimmet[]>([]);
    const [urunler, setUrunler] = useState<any[]>([]);
    const [personeller, setPersoneller] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [durumFilter, setDurumFilter] = useState<string>('');
    // Filter data client-side with useMemo to prevent re-renders
    const filteredZimmetler = useMemo(() => {
        return zimmetler.filter(z => {
            const matchesSearch = z.urunAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                z.personelAdi.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDurum = !durumFilter || z.durum === durumFilter;
            return matchesSearch && matchesDurum;
        });
    }, [zimmetler, searchTerm, durumFilter]);

    const [formData, setFormData] = useState({
        urunId: '',
        personelId: '',
        zimmetTarihi: new Date().toISOString().split('T')[0],
        aciklama: '',
        durum: 'Aktif'
    });

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const { hasEntityPermission } = useAuth();
    const canAdd = hasEntityPermission('zimmet', 'add');
    const canEdit = hasEntityPermission('zimmet', 'edit');
    const canDelete = hasEntityPermission('zimmet', 'delete');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            console.log('Loading zimmet data from API...');
            const [zimmetData, urunData, personelData] = await Promise.all([
                zimmetService.getAll(),
                urunService.getAll(),
                personelService.getAll()
            ]);

            console.log('Data loaded:', { zimmetData, urunData, personelData });

            setZimmetler(Array.isArray(zimmetData) ? zimmetData : []);
            setUrunler(Array.isArray(urunData) ? urunData : []);
            setPersoneller(Array.isArray(personelData) ? personelData : []);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'badge-success';
            case 'Iade': return 'badge-info';
            case 'Kayip': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const handleEdit = (zimmet: Zimmet) => {
        setEditingId(zimmet.id);
        const urun = urunler.find(u => u.ad === zimmet.urunAdi);
        const personel = personeller.find(p => p.tamAd === zimmet.personelAdi);

        setFormData({
            urunId: urun ? urun.id.toString() : zimmet.urunId.toString(),
            personelId: personel ? personel.id.toString() : zimmet.personelId.toString(),
            zimmetTarihi: zimmet.zimmetTarihi.split('T')[0],
            aciklama: zimmet.aciklama || '',
            durum: zimmet.durum
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId === null) return;
        try {
            await zimmetService.delete(deleteTargetId);
            loadData();
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            const data = {
                urunId: parseInt(formData.urunId),
                personelId: parseInt(formData.personelId),
                zimmetTarihi: formData.zimmetTarihi,
                aciklama: formData.aciklama,
                durum: formData.durum
            };

            if (editingId) {
                await zimmetService.update(editingId, data);
            } else {
                await zimmetService.create(data);
            }
            loadData();
            closeModal();
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        } finally {
            setShowSaveConfirm(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            urunId: '',
            personelId: '',
            zimmetTarihi: new Date().toISOString().split('T')[0],
            aciklama: '',
            durum: 'Aktif'
        });
    };

    // Memoize columns to prevent DataTable re-renders
    const columns: Column<Zimmet>[] = useMemo(() => [
        {
            header: 'Ürün',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {zimmet.urunAdi}
                </span>
            )
        },
        { header: 'Personel', accessor: 'personelAdi' as keyof Zimmet },
        {
            header: 'Zimmet Tarihi',
            render: (zimmet: Zimmet) => new Date(zimmet.zimmetTarihi).toLocaleDateString('tr-TR')
        },
        {
            header: 'İade Tarihi',
            render: (zimmet: Zimmet) => zimmet.iadeTarihi
                ? new Date(zimmet.iadeTarihi).toLocaleDateString('tr-TR')
                : '-'
        },
        {
            header: 'Durum',
            render: (zimmet: Zimmet) => (
                <span className={`badge ${getDurumBadge(zimmet.durum)} `}>
                    {zimmet.durum}
                </span>
            )
        },
        {
            header: 'Açıklama',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-muted)', maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {zimmet.aciklama || '-'}
                </span>
            )
        },
        ...((canEdit || canDelete) ? [{
            header: 'İşlemler',
            render: (zimmet: Zimmet) => (
                <div className="flex gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(zimmet)}>
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(zimmet.id)}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }] : [])
    ], [canEdit, canDelete]);

    return (
        <>
            <div className="page-content">
                {/* Header Title */}
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                    Zimmetler
                </h1>

                {/* Stats & Controls Container */}
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>

                    {/* Stats Grid */}
                    <div className="dashboard-grid" style={{
                        flex: 1,
                        marginBottom: 0,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)', // Force 4 equal columns filling all space
                        gap: 'var(--spacing-md)'
                    }}>
                        <div className="stat-card">
                            <div className="stat-card-icon">
                                <ClipboardList size={24} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{zimmetler.length}</div>
                                <div className="stat-card-label">Toplam Zimmet</div>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-card-icon success">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{zimmetler.filter(z => z.durum === 'Aktif').length}</div>
                                <div className="stat-card-label">Aktif Zimmet</div>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <div className="stat-card-icon info">
                                <RotateCcw size={24} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">
                                    {zimmetler.filter(z => z.durum === 'Iade').length}
                                </div>
                                <div className="stat-card-label">İade Edilmiş</div>
                            </div>
                        </div>
                        <div className="stat-card error">
                            <div className="stat-card-icon error">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">
                                    {zimmetler.filter(z => z.durum === 'Kayip').length}
                                </div>
                                <div className="stat-card-label">Kayıp</div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Stack */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', width: '300px', flexShrink: 0 }}>
                        {/* Search Bar */}
                        <div className="search-box" style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Ürün veya personel ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '36px', width: '100%' }}
                            />
                        </div>

                        {/* Add Button */}
                        {canAdd && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowModal(true)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', width: '100%' }}
                            >
                                <Plus size={18} /> Zimmet Ekle
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={filteredZimmetler}
                    // Controls removed from here as they are now custom placed above
                    emptyMessage="Zimmet kaydı bulunamadı."
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Zimmet Düzenle' : 'Zimmet Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Ürün</label>
                                    <select className="form-select" required value={formData.urunId}
                                        onChange={(e) => setFormData({ ...formData, urunId: e.target.value })}>
                                        <option value="">Ürün Seçiniz</option>
                                        {urunler.map((u) => (
                                            <option key={u.id} value={u.id}>{u.ad} ({u.stokMiktari} Stok)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Personel</label>
                                    <select className="form-select" required value={formData.personelId}
                                        onChange={(e) => setFormData({ ...formData, personelId: e.target.value })}>
                                        <option value="">Personel Seçiniz</option>
                                        {personeller.map((p) => (
                                            <option key={p.id} value={p.id}>{p.tamAd}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Zimmet Tarihi</label>
                                    <input type="date" className="form-input" required value={formData.zimmetTarihi}
                                        onChange={(e) => setFormData({ ...formData, zimmetTarihi: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Durum</label>
                                    <select className="form-select" value={formData.durum}
                                        onChange={(e) => setFormData({ ...formData, durum: e.target.value })}>
                                        <option value="Aktif">Durum: Aktif</option>
                                        <option value="Iade">Durum: İade</option>
                                        <option value="Kayip">Durum: Kayıp</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={3} value={formData.aciklama}
                                        placeholder="Açıklama"
                                        onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>İptal</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Güncelle' : 'Kaydet'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message={editingId ? 'Bu zimmet kaydını güncellemek istediğinize emin misiniz?' : 'Yeni zimmet kaydı eklemek istediğinize emin misiniz?'}
                confirmText={editingId ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu zimmet kaydını silmek istediğinize emin misiniz?"
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
            />
        </>
    );
}
