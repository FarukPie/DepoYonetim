import { useState, useEffect } from 'react';
import { Plus, X, Warehouse, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { depoService, personelService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Depo, Personel } from '../types';

export default function Depolar() {
    const { hasEntityPermission } = useAuth();
    const [depolar, setDepolar] = useState<Depo[]>([]);
    const [personeller, setPersoneller] = useState<Personel[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingDepo, setEditingDepo] = useState<Depo | null>(null);
    const [formData, setFormData] = useState({ ad: '', aciklama: '', sorumluPersonelId: '', aktif: true });

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
            setDepolar(depolarData);
            setPersoneller(personellerData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const openAddModal = () => {
        setEditingDepo(null);
        setFormData({ ad: '', aciklama: '', sorumluPersonelId: '', aktif: true });
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

    const handleDelete = async (id: number) => {
        if (confirm('Bu depoyu silmek istediğinize emin misiniz?')) {
            try {
                await depoService.delete(id);
                loadData();
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Silme işlemi sırasında bir hata oluştu.');
            }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            setFormData({ ad: '', aciklama: '', sorumluPersonelId: '', aktif: true });
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Depolar</h1>
                    <p>Hastane depolarını yönetin</p>
                </div>
            </header>

            <div className="page-content">
                {canAdd && (
                    <div className="toolbar">
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <Plus size={18} /> Yeni Depo Ekle
                        </button>
                    </div>
                )}

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Depo Adı</th>
                                <th>Açıklama</th>
                                <th>Sorumlu</th>
                                <th>Ürün Sayısı</th>
                                <th>Durum</th>
                                {(canEdit || canDelete) && <th>İşlemler</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {depolar.map((depo) => (
                                <tr key={depo.id}>
                                    <td style={{ color: 'var(--text-primary)' }}>
                                        <div className="flex items-center gap-md">
                                            <div style={{ width: '36px', height: '36px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
                                                <Warehouse size={18} />
                                            </div>
                                            {depo.ad}
                                        </div>
                                    </td>
                                    <td>{depo.aciklama || '-'}</td>
                                    <td>{depo.sorumluPersonelAdi || '-'}</td>
                                    <td>{depo.urunSayisi}</td>
                                    <td>
                                        {canEdit ? (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <button
                                                    className={`btn btn-icon ${depo.aktif ? 'btn-success' : 'btn-secondary'}`}
                                                    onClick={() => toggleAktif(depo)}
                                                    title={depo.aktif ? 'Pasif yap' : 'Aktif yap'}
                                                    style={{
                                                        background: depo.aktif ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
                                                        color: depo.aktif ? 'var(--primary-400)' : 'var(--text-muted)'
                                                    }}
                                                >
                                                    {depo.aktif ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                </button>
                                                <span className={`badge ${depo.aktif ? 'badge-success' : 'badge-neutral'}`} style={{ marginLeft: '8px' }}>
                                                    {depo.aktif ? 'Aktif' : 'Pasif'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={`badge ${depo.aktif ? 'badge-success' : 'badge-neutral'}`}>
                                                {depo.aktif ? 'Aktif' : 'Pasif'}
                                            </span>
                                        )}
                                    </td>
                                    {(canEdit || canDelete) && (
                                        <td>
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
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingDepo ? 'Depo Düzenle' : 'Yeni Depo Ekle'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Depo Adı *</label>
                                    <input type="text" className="form-input" required
                                        value={formData.ad} onChange={(e) => setFormData({ ...formData, ad: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sorumlu Personel</label>
                                    <select className="form-select" value={formData.sorumluPersonelId}
                                        onChange={(e) => setFormData({ ...formData, sorumluPersonelId: e.target.value })}>
                                        <option value="">Seçiniz</option>
                                        {personeller.map((p) => (
                                            <option key={p.id} value={p.id}>{p.tamAd}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={3}
                                        value={formData.aciklama} onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input type="checkbox" checked={formData.aktif}
                                            onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })} />
                                        <span>Aktif</span>
                                    </label>
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
        </>
    );
}
