import { useState, useEffect } from 'react';
import { Plus, X, Search, UserCog, Edit, Trash2 } from 'lucide-react';
import { personelService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Personel } from '../types';

export default function Personeller() {
    const { hasEntityPermission } = useAuth();
    const [personeller, setPersoneller] = useState<Personel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        ad: '', soyad: '', tcNo: '', departman: '',
        unvan: '', telefon: '', email: '', iseGirisTarihi: ''
    });

    const canAdd = hasEntityPermission('personel', 'add');
    const canEdit = hasEntityPermission('personel', 'edit');
    const canDelete = hasEntityPermission('personel', 'delete');

    useEffect(() => {
        loadPersoneller();
    }, [searchTerm]);

    const loadPersoneller = async () => {
        try {
            const data = await personelService.getAll();
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const filtered = data.filter((p: Personel) =>
                    (p.tamAd && p.tamAd.toLowerCase().includes(term)) ||
                    (p.departman && p.departman.toLowerCase().includes(term))
                );
                setPersoneller(filtered);
            } else {
                setPersoneller(data);
            }
        } catch (error) {
            console.error('Veri yüklenirken hata oluştu:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bu personeli silmek istediğinize emin misiniz?')) {
            try {
                await personelService.delete(id);
                loadPersoneller();
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Silme işlemi sırasında bir hata oluştu. Bu personelin üzerinde zimmet olabilir.');
            }
        }
    };

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Personeller</h1>
                    <p>Hastane personellerini yönetin</p>
                </div>
            </header>

            <div className="page-content">
                <div className="toolbar">
                    <div className="search-box">
                        <Search />
                        <input type="text" placeholder="Personel veya departman ara..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {canAdd && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Yeni Personel Ekle
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ad Soyad</th>
                                <th>Departman</th>
                                <th>Ünvan</th>
                                <th>Telefon</th>
                                <th>E-posta</th>
                                <th>Zimmet</th>
                                <th>Durum</th>
                                {(canEdit || canDelete) && <th>İşlemler</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {personeller.map((personel) => (
                                <tr key={personel.id}>
                                    <td style={{ color: 'var(--text-primary)' }}>
                                        <div className="flex items-center gap-md">
                                            <div style={{
                                                width: '40px', height: '40px',
                                                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                                                borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: 600, fontSize: '0.875rem'
                                            }}>
                                                {personel.ad[0]}{personel.soyad[0]}
                                            </div>
                                            <div>
                                                <div>{personel.tamAd}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {personel.iseGirisTarihi ? `İşe giriş: ${new Date(personel.iseGirisTarihi).toLocaleDateString('tr-TR')}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{personel.departman || '-'}</td>
                                    <td>{personel.unvan || '-'}</td>
                                    <td>{personel.telefon || '-'}</td>
                                    <td>{personel.email || '-'}</td>
                                    <td>
                                        {personel.zimmetSayisi > 0 ? (
                                            <span className="badge badge-warning">{personel.zimmetSayisi} ürün</span>
                                        ) : (
                                            <span className="badge badge-neutral">Yok</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${personel.aktif ? 'badge-success' : 'badge-neutral'}`}>
                                            {personel.aktif ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    {(canEdit || canDelete) && (
                                        <td>
                                            <div className="flex gap-sm">
                                                {canEdit && <button className="btn btn-icon btn-secondary"><Edit size={16} /></button>}
                                                {canDelete && (
                                                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(personel.id)}>
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
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>Yeni Personel Ekle</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Ad *</label>
                                        <input type="text" className="form-input" required value={formData.ad}
                                            onChange={(e) => setFormData({ ...formData, ad: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Soyad *</label>
                                        <input type="text" className="form-input" required value={formData.soyad}
                                            onChange={(e) => setFormData({ ...formData, soyad: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">TC Kimlik No</label>
                                        <input type="text" className="form-input" maxLength={11} value={formData.tcNo}
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
                                            placeholder="Örn: Bilgi İşlem" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ünvan</label>
                                        <input type="text" className="form-input" value={formData.unvan}
                                            onChange={(e) => setFormData({ ...formData, unvan: e.target.value })}
                                            placeholder="Örn: Sistem Yöneticisi" />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Telefon</label>
                                        <input type="text" className="form-input" value={formData.telefon}
                                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                                            placeholder="0532 XXX XXXX" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">E-posta</label>
                                        <input type="email" className="form-input" value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="ornek@canhastanesi.com" />
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
        </>
    );
}
