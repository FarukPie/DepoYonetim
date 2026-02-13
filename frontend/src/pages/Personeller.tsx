import { useState, useEffect, useMemo } from 'react';
import { X, Search, UserCog, Edit, Trash2 } from 'lucide-react';
import { personelService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Personel } from '../types';
import { DataTable } from '../components/shared/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Personeller() {
    const { hasEntityPermission } = useAuth();
    const [personeller, setPersoneller] = useState<Personel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        ad: '', soyad: '', tcNo: '', departman: '',
        unvan: '', telefon: '', email: '', iseGirisTarihi: ''
    });

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const canAdd = hasEntityPermission('personel', 'add');
    const canEdit = hasEntityPermission('personel', 'edit');
    const canDelete = hasEntityPermission('personel', 'delete');

    useEffect(() => {
        loadPersoneller();
    }, []);

    const loadPersoneller = async () => {
        try {
            const data = await personelService.getAll();
            setPersoneller(data);
        } catch (error) {
            console.error('Veri yüklenirken hata oluştu:', error);
        }
    };

    // Filter data client-side with useMemo to prevent re-renders
    const filteredPersoneller = useMemo(() => {
        if (!searchTerm) return personeller;
        const term = searchTerm.toLowerCase();
        return personeller.filter((p: Personel) =>
            (p.tamAd && p.tamAd.toLowerCase().includes(term)) ||
            (p.departman && p.departman.toLowerCase().includes(term))
        );
    }, [personeller, searchTerm]);

    // Stable data for DataTable - only update when modal is closed to prevent flickering
    const [stableTableData, setStableTableData] = useState<Personel[]>([]);
    useEffect(() => {
        if (!showModal) {
            setStableTableData(filteredPersoneller);
        }
    }, [filteredPersoneller, showModal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            await personelService.create({
                ...formData,
                tamAd: `${formData.ad} ${formData.soyad}`,
                zimmetSayisi: 0,
                aktif: true
            });
            loadPersoneller();
            setShowModal(false);
            setFormData({ ad: '', soyad: '', tcNo: '', departman: '', unvan: '', telefon: '', email: '', iseGirisTarihi: '' });
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        } finally {
            setShowSaveConfirm(false);
        }
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId === null) return;
        try {
            await personelService.delete(deleteTargetId);
            loadPersoneller();
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme işlemi sırasında bir hata oluştu. Bu personelin üzerinde zimmet olabilir.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    // Memoize columns to prevent DataTable re-renders
    const columns = useMemo(() => [
        {
            header: 'Ad Soyad',
            render: (personel: Personel) => (
                <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{personel.tamAd}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {personel.iseGirisTarihi ? `İşe giriş: ${new Date(personel.iseGirisTarihi).toLocaleDateString('tr-TR')}` : ''}
                    </div>
                </div>
            )
        },
        { header: 'Departman', accessor: 'departman' as keyof Personel, render: (p: Personel) => p.departman || '-' },
        { header: 'Ünvan', accessor: 'unvan' as keyof Personel, render: (p: Personel) => p.unvan || '-' },
        { header: 'Telefon', accessor: 'telefon' as keyof Personel, render: (p: Personel) => p.telefon || '-' },
        { header: 'E-posta', accessor: 'email' as keyof Personel, render: (p: Personel) => p.email || '-' },
        {
            header: 'Zimmet',
            render: (p: Personel) => (
                (p.zimmetSayisi || 0) > 0 ? (
                    <span className="badge badge-warning">{p.zimmetSayisi} ürün</span>
                ) : (
                    <span className="badge badge-neutral">Yok</span>
                )
            )
        },
        {
            header: 'Durum',
            render: (p: Personel) => (
                <span className={`badge ${p.aktif ? 'badge-success' : 'badge-neutral'}`}>
                    {p.aktif ? 'Aktif' : 'Pasif'}
                </span>
            )
        },
        ...((canEdit || canDelete) ? [{
            header: 'İşlemler',
            render: (personel: Personel) => (
                <div className="flex gap-sm">
                    {canEdit && <button className="btn btn-icon btn-secondary"><Edit size={16} /></button>}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(personel.id)}>
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
                    title="Personeller"
                    searchable={true}
                    onSearch={(term) => setSearchTerm(term)}
                    searchPlaceholder="Personel veya departman ara..."
                    onAdd={canAdd ? () => setShowModal(true) : undefined}
                    addButtonLabel="Personel Ekle"
                    emptyMessage="Hiç personel bulunamadı."
                    data={stableTableData}
                    columns={columns}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>Personel Ekle</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Ad</label>
                                        <input type="text" className="form-input" required value={formData.ad}
                                            placeholder="Ad"
                                            onChange={(e) => setFormData({ ...formData, ad: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Soyad</label>
                                        <input type="text" className="form-input" required value={formData.soyad}
                                            placeholder="Soyad"
                                            onChange={(e) => setFormData({ ...formData, soyad: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">TC Kimlik No</label>
                                        <input type="text" className="form-input" maxLength={11} value={formData.tcNo}
                                            placeholder="TC Kimlik No"
                                            onChange={(e) => setFormData({ ...formData, tcNo: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">İşe Giriş Tarihi</label>
                                        <input type="date" className="form-input" value={formData.iseGirisTarihi}
                                            onChange={(e) => setFormData({ ...formData, iseGirisTarihi: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Departman</label>
                                        <input type="text" className="form-input" value={formData.departman}
                                            onChange={(e) => setFormData({ ...formData, departman: e.target.value })}
                                            placeholder="Departman (Örn: Bilgi İşlem)" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ünvan</label>
                                        <input type="text" className="form-input" value={formData.unvan}
                                            onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                                            placeholder="Ünvan (Örn: Sistem Yöneticisi)" />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Telefon</label>
                                        <input type="text" className="form-input" value={formData.telefon}
                                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                                            placeholder="Telefon (0532 XXX XXXX)" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">E-posta</label>
                                        <input type="email" className="form-input" value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="E-posta (ornek@sirket.com)" />
                                    </div>
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

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message="Yeni personel eklemek istediğinize emin misiniz?"
                confirmText="Kaydet"
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu personeli silmek istediğinize emin misiniz? Üzerinde zimmet varsa silinemeyebilir."
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="info"
            />
        </>
    );
}
