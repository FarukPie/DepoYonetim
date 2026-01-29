import { useState, useEffect } from 'react';
import { Plus, X, FolderTree, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { kategoriService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Kategori } from '../types';

export default function Kategoriler() {
    const { hasEntityPermission } = useAuth();
    const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
    const [anaKategoriler, setAnaKategoriler] = useState<Kategori[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);
    const [formData, setFormData] = useState({ ad: '', aciklama: '', ustKategoriId: '' });

    const canAdd = hasEntityPermission('kategori', 'add');
    const canEdit = hasEntityPermission('kategori', 'edit');
    const canDelete = hasEntityPermission('kategori', 'delete');

    useEffect(() => {
        loadKategoriler();
    }, []);

    const loadKategoriler = async () => {
        try {
            const data = await kategoriService.getAll();
            setKategoriler(data);
            setAnaKategoriler(data.filter(k => !k.ustKategoriId));
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const getAltKategoriler = (ustId: number) => {
        return kategoriler.filter(k => k.ustKategoriId === ustId);
    };

    const openAddModal = () => {
        setEditingKategori(null);
        setFormData({ ad: '', aciklama: '', ustKategoriId: '' });
        setShowModal(true);
    };

    const openEditModal = (kategori: Kategori) => {
        setEditingKategori(kategori);
        setFormData({
            ad: kategori.ad,
            aciklama: kategori.aciklama || '',
            ustKategoriId: kategori.ustKategoriId?.toString() || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
            try {
                await kategoriService.delete(id);
                loadKategoriler();
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Silme sırasında bir hata oluştu.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ad: formData.ad,
            aciklama: formData.aciklama || undefined,
            ustKategoriId: formData.ustKategoriId ? parseInt(formData.ustKategoriId) : null,
            ustKategoriAdi: anaKategoriler.find(k => k.id === parseInt(formData.ustKategoriId))?.ad,
        };

        try {
            if (editingKategori) {
                await kategoriService.update(editingKategori.id, data);
            } else {
                await kategoriService.create(data);
            }
            loadKategoriler();
            setShowModal(false);
            setFormData({ ad: '', aciklama: '', ustKategoriId: '' });
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Kategoriler</h1>
                    <p>Ürün kategorilerini hiyerarşik olarak yönetin</p>
                </div>
            </header>

            <div className="page-content">
                {canAdd && (
                    <div className="toolbar">
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <Plus size={18} /> Yeni Kategori Ekle
                        </button>
                    </div>
                )}

                <div className="category-tree">
                    {anaKategoriler.map((anaKategori) => (
                        <div key={anaKategori.id}>
                            {/* Ana Kategori */}
                            <div className="category-item">
                                <div className="category-info">
                                    <div className="category-icon">
                                        <FolderTree size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{anaKategori.ad}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{anaKategori.aciklama}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-md">
                                    <span className="badge badge-info">{anaKategori.altKategoriSayisi} alt kategori</span>
                                    {canEdit && (
                                        <button className="btn btn-icon btn-secondary" onClick={() => openEditModal(anaKategori)}>
                                            <Edit size={16} />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(anaKategori.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {anaKategori.altKategoriSayisi > 0 && <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />}
                                </div>
                            </div>

                            {/* Alt Kategoriler */}
                            {getAltKategoriler(anaKategori.id).map((altKategori) => (
                                <div key={altKategori.id} className="category-item sub-category">
                                    <div className="category-info">
                                        <div className="category-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-info)' }}>
                                            <FolderTree size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{altKategori.ad}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{altKategori.aciklama}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-md">
                                        <span className="badge badge-neutral">{altKategori.urunSayisi} ürün</span>
                                        {canEdit && (
                                            <button className="btn btn-icon btn-secondary" onClick={() => openEditModal(altKategori)}>
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button className="btn btn-icon btn-danger" onClick={() => handleDelete(altKategori.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingKategori ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Kategori Adı *</label>
                                    <input type="text" className="form-input" required value={formData.ad}
                                        onChange={(e) => setFormData({ ...formData, ad: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Üst Kategori (Opsiyonel)</label>
                                    <select className="form-select" value={formData.ustKategoriId}
                                        onChange={(e) => setFormData({ ...formData, ustKategoriId: e.target.value })}>
                                        <option value="">Ana Kategori Olarak Ekle</option>
                                        {anaKategoriler.filter(k => k.id !== editingKategori?.id).map((k) => (
                                            <option key={k.id} value={k.id}>{k.ad}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={3} value={formData.aciklama}
                                        onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">{editingKategori ? 'Güncelle' : 'Kaydet'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
