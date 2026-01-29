import { useState, useEffect } from 'react';
import { Plus, X, Search, Building2, Edit, Trash2 } from 'lucide-react';
import { cariService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Cari } from '../types';

export default function Cariler() {
    const { hasEntityPermission } = useAuth();
    const [cariler, setCariler] = useState<Cari[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        firmaAdi: '', tip: 'Tedarikci', vergiNo: '', vergiDairesi: '',
        adres: '', il: '', ilce: '', telefon: '', fax: '',
        email: '', webSitesi: '', yetkiliKisi: '', yetkiliTelefon: '',
        bankaAdi: '', ibanNo: ''
    });

    const canAdd = hasEntityPermission('cari', 'add');
    const canEdit = hasEntityPermission('cari', 'edit');
    const canDelete = hasEntityPermission('cari', 'delete');

    useEffect(() => {
        loadCariler();
    }, [searchTerm]);

    const loadCariler = async () => {
        try {
            const data = await cariService.getAll();
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const filtered = data.filter((c: Cari) =>
                    c.firmaAdi.toLowerCase().includes(term)
                );
                setCariler(filtered);
            } else {
                setCariler(data);
            }
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await cariService.create(formData);
            loadCariler();
            setShowModal(false);
            setFormData({
                firmaAdi: '', tip: 'Tedarikci', vergiNo: '', vergiDairesi: '',
                adres: '', il: '', ilce: '', telefon: '', fax: '',
                email: '', webSitesi: '', yetkiliKisi: '', yetkiliTelefon: '',
                bankaAdi: '', ibanNo: ''
            });
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bu cariyi silmek istediğinize emin misiniz?')) {
            try {
                await cariService.delete(id);
                loadCariler();
            } catch (error) {
                console.error('Silme hatası:', error);
                if (error.response?.data?.message) {
                    alert('Hata: ' + error.response.data.message);
                } else {
                    alert('Silme sırasında bir hata oluştu. İlişkili faturalar olabilir.');
                }
            }
        }
    };



    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Cariler</h1>
                    <p>Tedarikçi ve müşteri bilgilerini yönetin</p>
                </div>
            </header>

            <div className="page-content">
                <div className="toolbar">
                    <div className="search-box">
                        <Search />
                        <input type="text" placeholder="Cari ara..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {canAdd && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Yeni Cari Ekle
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Firma Adı</th>
                                <th>Tip</th>
                                <th>Vergi No</th>
                                <th>İl/İlçe</th>
                                <th>Yetkili</th>
                                <th>Telefon</th>
                                {(canEdit || canDelete) && <th>İşlemler</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {cariler.map((cari) => (
                                <tr key={cari.id}>
                                    <td style={{ color: 'var(--text-primary)' }}>
                                        <div className="flex items-center gap-md">
                                            <div style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-info)' }}>
                                                <Building2 size={18} />
                                            </div>
                                            <div>
                                                <div>{cari.firmaAdi}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cari.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${cari.tip === 'Tedarikci' ? 'badge-info' : 'badge-success'}`}>{cari.tip === 'Tedarikci' ? 'Tedarikçi' : 'Müşteri'}</span></td>
                                    <td>{cari.vergiNo || '-'}</td>
                                    <td>{cari.il ? `${cari.il}/${cari.ilce}` : '-'}</td>
                                    <td>{cari.yetkiliKisi || '-'}</td>
                                    <td>{cari.telefon || '-'}</td>
                                    {(canEdit || canDelete) && (
                                        <td>
                                            <div className="flex gap-sm">
                                                {canEdit && <button className="btn btn-icon btn-secondary"><Edit size={16} /></button>}
                                                {canDelete && (
                                                    <button className="btn btn-icon btn-danger" onClick={() => handleDelete(cari.id)}>
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
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Yeni Cari Ekle</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Firma Adı *</label>
                                        <input type="text" className="form-input" required value={formData.firmaAdi}
                                            onChange={(e) => setFormData({ ...formData, firmaAdi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cari Tipi</label>
                                        <select className="form-select" value={formData.tip}
                                            onChange={(e) => setFormData({ ...formData, tip: e.target.value })}>
                                            <option value="Tedarikci">Tedarikçi</option>
                                            <option value="Musteri">Müşteri</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Vergi No</label>
                                        <input type="text" className="form-input" value={formData.vergiNo}
                                            onChange={(e) => setFormData({ ...formData, vergiNo: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Vergi Dairesi</label>
                                        <input type="text" className="form-input" value={formData.vergiDairesi}
                                            onChange={(e) => setFormData({ ...formData, vergiDairesi: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Adres</label>
                                    <input type="text" className="form-input" value={formData.adres}
                                        onChange={(e) => setFormData({ ...formData, adres: e.target.value })} />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">İl</label>
                                        <input type="text" className="form-input" value={formData.il}
                                            onChange={(e) => setFormData({ ...formData, il: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">İlçe</label>
                                        <input type="text" className="form-input" value={formData.ilce}
                                            onChange={(e) => setFormData({ ...formData, ilce: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Telefon</label>
                                        <input type="text" className="form-input" value={formData.telefon}
                                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">E-posta</label>
                                        <input type="email" className="form-input" value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Yetkili Kişi</label>
                                        <input type="text" className="form-input" value={formData.yetkiliKisi}
                                            onChange={(e) => setFormData({ ...formData, yetkiliKisi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Yetkili Telefon</label>
                                        <input type="text" className="form-input" value={formData.yetkiliTelefon}
                                            onChange={(e) => setFormData({ ...formData, yetkiliTelefon: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Banka Adı</label>
                                        <input type="text" className="form-input" value={formData.bankaAdi}
                                            onChange={(e) => setFormData({ ...formData, bankaAdi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IBAN No</label>
                                        <input type="text" className="form-input" value={formData.ibanNo}
                                            onChange={(e) => setFormData({ ...formData, ibanNo: e.target.value })} />
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
