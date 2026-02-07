import { useState, useEffect, useMemo } from 'react';
import { X, Warehouse, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { depoService, personelService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Depo, Personel } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Depolar() {
    const { hasEntityPermission } = useAuth();
    const [allDepolar, setAllDepolar] = useState<Depo[]>([]);
    const [filteredDepolar, setFilteredDepolar] = useState<Depo[]>([]);
    const [personeller, setPersoneller] = useState<Personel[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingDepo, setEditingDepo] = useState<Depo | null>(null);
    const [formData, setFormData] = useState({ ad: '', aciklama: '', sorumluPersonelId: '', aktif: false });

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const canAdd = hasEntityPermission('depo', 'add');
    const canEdit = hasEntityPermission('depo', 'edit');
    const canDelete = hasEntityPermission('depo', 'delete');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [depolarData, personellerData] = await Promise.all([
                depoService.getAll(),
                personelService.getAll()
            ]);
            setAllDepolar(depolarData);
            setFilteredDepolar(depolarData);
            setPersoneller(personellerData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const handleSearch = (term: string) => {
        if (!term) {
            setFilteredDepolar(allDepolar);
            return;
        }
        const lowerTerm = term.toLowerCase();
        const filtered = allDepolar.filter(d =>
            d.ad.toLowerCase().includes(lowerTerm) ||
            d.aciklama?.toLowerCase().includes(lowerTerm) ||
            d.sorumluPersonelAdi?.toLowerCase().includes(lowerTerm)
        );
        setFilteredDepolar(filtered);
    };

    const openAddModal = () => {
        setEditingDepo(null);
        setFormData({ ad: '', aciklama: '', sorumluPersonelId: '', aktif: false });
        setShowModal(true);
    };

    const openEditModal = (depo: Depo) => {
        setEditingDepo(depo);
        setFormData({
            ad: depo.ad,
            aciklama: depo.aciklama || '',
            sorumluPersonelId: depo.sorumluPersonelId?.toString() || '',
            aktif: depo.aktif
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
            await depoService.delete(deleteTargetId);
            loadData();
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme işlemi sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    const toggleAktif = async (depo: Depo) => {
        try {
            await depoService.update(depo.id, { ...depo, aktif: !depo.aktif });
            loadData();
        } catch (error) {
            console.error('Güncelleme hatası:', error);
            alert('Güncelleme sırasında bir hata oluştu.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        const data = {
            ad: formData.ad,
            aciklama: formData.aciklama || undefined,
            sorumluPersonelId: formData.sorumluPersonelId ? parseInt(formData.sorumluPersonelId) : null,
            aktif: formData.aktif,
        };

        try {
            if (editingDepo) {
                await depoService.update(editingDepo.id, data);
            } else {
                await depoService.create(data);
            }
            loadData();
            setShowModal(false);
            setFormData({ ad: '', aciklama: '', sorumluPersonelId: '', aktif: false });
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        } finally {
            setShowSaveConfirm(false);
        }
    };

    // Memoize columns to prevent DataTable re-renders
    const columns: Column<Depo>[] = useMemo(() => [
        {
            header: 'Depo Adı',
            render: (depo: Depo) => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{depo.ad}</span>
            )
        },
        { header: 'Açıklama', accessor: 'aciklama' as keyof Depo, render: (depo: Depo) => depo.aciklama || '-' },
        { header: 'Sorumlu', accessor: 'sorumluPersonelAdi' as keyof Depo, render: (depo: Depo) => depo.sorumluPersonelAdi || '-' },
        { header: 'Ürün Sayısı', accessor: 'urunSayisi' as keyof Depo },
        {
            header: 'Durum',
            render: (depo: Depo) => (
                canEdit ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            className={`btn btn-icon ${depo.aktif ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => toggleAktif(depo)}
                            title={depo.aktif ? 'Pasif yap' : 'Aktif yap'}
                            style={{
                                background: depo.aktif ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
                                color: depo.aktif ? 'var(--primary-400)' : 'var(--text-muted)',
                                marginRight: '8px'
                            }}
                        >
                            {depo.aktif ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <span className={`badge ${depo.aktif ? 'badge-success' : 'badge-neutral'}`}>
                            {depo.aktif ? 'Aktif' : 'Pasif'}
                        </span>
                    </div>
                ) : (
                    <span className={`badge ${depo.aktif ? 'badge-success' : 'badge-neutral'}`}>
                        {depo.aktif ? 'Aktif' : 'Pasif'}
                    </span>
                )
            )
        },
        // Only show Actions column if user has edit or delete permission
        ...((canEdit || canDelete) ? [{
            header: 'İşlemler',
            render: (depo: Depo) => (
                <div className="flex gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => openEditModal(depo)}>
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(depo.id)}>
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
                <DataTable
                    title="Depolar"
                    columns={columns}
                    data={filteredDepolar}
                    searchable={true}
                    onSearch={handleSearch}
                    searchPlaceholder="Depo ara..."
                    onAdd={canAdd ? openAddModal : undefined}
                    addButtonLabel="Depo Ekle"
                    emptyMessage="Hiç depo bulunamadı."
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingDepo ? 'Depo Düzenle' : 'Depo Ekle'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Depo Adı</label>
                                    <input type="text" className="form-input" required
                                        placeholder="Depo Adı"
                                        value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sorumlu Personel</label>
                                    <select className="form-select" value={formData.sorumluPersonelId}
                                        onChange={(e) => setFormData({ ...formData, sorumluPersonelId: e.target.value })}>
                                        <option value="">Sorumlu Personel Seçiniz</option>
                                        {personeller.map((p) => (
                                            <option key={p.id} value={p.id}>{p.tamAd}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={3}
                                        placeholder="Açıklama"
                                        value={formData.aciklama} onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <label className="form-checkbox">
                                        <input type="checkbox" checked={formData.aktif}
                                            onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })} />
                                        <span>Aktif</span>
                                    </label>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: '4px', textAlign: 'right' }}>
                                        {!formData.aktif ? 'Deponuz pasif olarak kaydedilecektir. Aktif etmek için kutucuğu işaretleyiniz.' : 'Depo aktif olarak kaydedilecektir.'}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">{editingDepo ? 'Güncelle' : 'Kaydet'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message={editingDepo ? 'Bu depoyu güncellemek istediğinize emin misiniz?' : 'Yeni depo eklemek istediğinize emin misiniz?'}
                confirmText={editingDepo ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu depoyu silmek istediğinize emin misiniz?"
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
            />
        </>
    );
}
