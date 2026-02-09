import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X, Building2, Edit, Trash2, Eye } from 'lucide-react';
import { cariService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Cari } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import { getIller, getIlceler, getVergiDaireleri } from '../data/turkiyeData';

export default function Cariler() {
    const { hasEntityPermission } = useAuth();
    const [cariler, setCariler] = useState<Cari[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewingCari, setViewingCari] = useState<Cari | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [formData, setFormData] = useState({
        firmaAdi: '', tip: 'Tedarikci', ticaretSicilNo: '', vergiNo: '', vergiDairesi: '',
        adres: '', il: '', ilce: '', telefon: '', fax: '',
        email: '', webSitesi: '', yetkiliKisi: '', yetkiliTelefon: '',
        bankaAdi: '', ibanNo: ''
    });

    const canAdd = hasEntityPermission('cari', 'add');
    const canEdit = hasEntityPermission('cari', 'edit');
    const canDelete = hasEntityPermission('cari', 'delete');

    useEffect(() => {
        loadCariler();
    }, []);

    const loadCariler = async () => {
        try {
            const data = await cariService.getAll();
            setCariler(data);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    // Filter data client-side with useMemo to prevent re-renders
    const filteredCariler = useMemo(() => {
        if (!searchTerm) return cariler;
        const term = searchTerm.toLowerCase();
        return cariler.filter((c: Cari) =>
            c.firmaAdi.toLowerCase().includes(term)
        );
    }, [cariler, searchTerm]);

    // Stable data for DataTable - only update when modal is closed to prevent flickering
    const [stableTableData, setStableTableData] = useState<Cari[]>([]);
    useEffect(() => {
        if (!showModal && !showViewModal) {
            setStableTableData(filteredCariler);
        }
    }, [filteredCariler, showModal, showViewModal]);

    const handleEdit = (cari: Cari) => {
        setEditingId(cari.id);
        setFormData({
            firmaAdi: cari.firmaAdi,
            tip: cari.tip,
            ticaretSicilNo: cari.ticaretSicilNo || '',
            vergiNo: cari.vergiNo || '',
            vergiDairesi: cari.vergiDairesi || '',
            adres: cari.adres || '',
            il: cari.il || '',
            ilce: cari.ilce || '',
            telefon: cari.telefon || '',
            fax: cari.fax || '',
            email: cari.email || '',
            webSitesi: cari.webSitesi || '',
            yetkiliKisi: cari.yetkiliKisi || '',
            yetkiliTelefon: cari.yetkiliTelefon || '',
            bankaAdi: cari.bankaAdi || '',
            ibanNo: cari.ibanNo || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await cariService.update(editingId, formData);
            } else {
                await cariService.create(formData);
            }
            loadCariler();
            closeModal();
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            firmaAdi: '', tip: 'Tedarikci', ticaretSicilNo: '', vergiNo: '', vergiDairesi: '',
            adres: '', il: '', ilce: '', telefon: '', fax: '',
            email: '', webSitesi: '', yetkiliKisi: '', yetkiliTelefon: '',
            bankaAdi: '', ibanNo: ''
        });
    };

    const handleDelete = async (id: number) => {
        if (confirm('Bu cariyi silmek istediğinize emin misiniz?')) {
            try {
                await cariService.delete(id);
                loadCariler();
            } catch (error: any) {
                console.error('Silme hatası:', error);
                if (error.response?.data?.message) {
                    alert('Hata: ' + error.response.data.message);
                } else {
                    alert('Silme sırasında bir hata oluştu. İlişkili faturalar olabilir.');
                }
            }
        }
    };

    const handleRowClick = useCallback((cari: Cari) => {
        setViewingCari(cari);
        setShowViewModal(true);
    }, []);

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingCari(null);
    };

    // Memoize columns to prevent DataTable re-renders
    const columns: Column<Cari>[] = useMemo(() => [
        {
            header: 'Firma Adı',
            render: (cari: Cari) => (
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cari.firmaAdi}>
                    {cari.firmaAdi}
                </div>
            )
        },
        { header: 'Ticaret Sicil No', accessor: 'ticaretSicilNo' as keyof Cari, render: (cari: Cari) => cari.ticaretSicilNo || '-' },
        { header: 'Vergi No', accessor: 'vergiNo' as keyof Cari, render: (cari: Cari) => cari.vergiNo || '-' },
        { header: 'İl', accessor: 'il' as keyof Cari, render: (cari: Cari) => cari.il || '-' },
        { header: 'İlçe', accessor: 'ilce' as keyof Cari, render: (cari: Cari) => cari.ilce || '-' },
        { header: 'Vergi Dairesi', accessor: 'vergiDairesi' as keyof Cari, render: (cari: Cari) => cari.vergiDairesi || '-' },
        {
            header: 'Adres',
            render: (cari: Cari) => (
                <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cari.adres}>
                    {cari.adres || '-'}
                </div>
            )
        },
        { header: 'Telefon', accessor: 'telefon' as keyof Cari, render: (cari: Cari) => cari.telefon || '-' },
        { header: 'E-Posta', accessor: 'email' as keyof Cari, render: (cari: Cari) => cari.email || '-' },
        { header: 'Yetkili Kişi', accessor: 'yetkiliKisi' as keyof Cari, render: (cari: Cari) => cari.yetkiliKisi || '-' },
        ...((canEdit || canDelete) ? [{
            header: 'İşlemler',
            render: (cari: Cari) => (
                <div className="flex gap-sm">
                    <button className="btn btn-icon btn-primary" onClick={() => handleRowClick(cari)} title="Görüntüle">
                        <Eye size={16} />
                    </button>
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(cari)} title="Düzenle">
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(cari.id)} title="Sil">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }] : [])
    ], [canEdit, canDelete, handleRowClick]);

    return (
        <>
            <div className="page-content">
                <DataTable
                    title="Cariler"
                    columns={columns}
                    data={stableTableData}
                    searchable={true}
                    onSearch={(term) => setSearchTerm(term)}
                    searchPlaceholder="Cari ara..."
                    onAdd={canAdd ? () => setShowModal(true) : undefined}
                    addButtonLabel="Cari Ekle"
                    emptyMessage="Hiç cari bulunamadı."
                    rowClickable={true}
                    onRowClick={handleRowClick}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.25rem' }}>{editingId ? 'Cari Düzenle' : 'Cari Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Firma Adı</label>
                                        <input type="text" className="form-input" required value={formData.firmaAdi}
                                            placeholder="Firma Adı"
                                            onChange={(e) => setFormData({ ...formData, firmaAdi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ticaret Sicil No</label>
                                        <input type="text" className="form-input" value={formData.ticaretSicilNo}
                                            placeholder="Ticaret Sicil No"
                                            onChange={(e) => setFormData({ ...formData, ticaretSicilNo: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Vergi No</label>
                                        <input type="text" className="form-input" value={formData.vergiNo}
                                            placeholder="Vergi No"
                                            onChange={(e) => setFormData({ ...formData, vergiNo: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">İl</label>
                                        <select className="form-select" value={formData.il}
                                            onChange={(e) => setFormData({ ...formData, il: e.target.value, ilce: '', vergiDairesi: '' })}>
                                            <option value="">İl Seçiniz</option>
                                            {getIller().map((il) => (
                                                <option key={il} value={il}>{il}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">İlçe</label>
                                        <select className="form-select" value={formData.ilce}
                                            onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                                            disabled={!formData.il}>
                                            <option value="">İlçe Seçiniz</option>
                                            {formData.il && getIlceler(formData.il).map((ilce) => (
                                                <option key={ilce} value={ilce}>{ilce}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Vergi Dairesi</label>
                                        <select className="form-select" value={formData.vergiDairesi}
                                            onChange={(e) => setFormData({ ...formData, vergiDairesi: e.target.value })}>
                                            <option value="">Vergi Dairesi Seçiniz</option>
                                            {formData.il && getVergiDaireleri(formData.il).map((vd) => (
                                                <option key={vd} value={vd}>{vd}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Adres</label>
                                    <input type="text" className="form-input" value={formData.adres}
                                        placeholder="Adres"
                                        onChange={(e) => setFormData({ ...formData, adres: e.target.value })} />
                                </div>

                                <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Telefon</label>
                                        <input type="text" className="form-input" value={formData.telefon}
                                            placeholder="Telefon"
                                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">E-posta</label>
                                        <input type="email" className="form-input" value={formData.email}
                                            placeholder="E-posta"
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Yetkili Kişi</label>
                                        <input type="text" className="form-input" value={formData.yetkiliKisi}
                                            placeholder="Yetkili Kişi"
                                            onChange={(e) => setFormData({ ...formData, yetkiliKisi: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Yetkili Telefon</label>
                                        <input type="text" className="form-input" value={formData.yetkiliTelefon}
                                            placeholder="Yetkili Telefon"
                                            onChange={(e) => setFormData({ ...formData, yetkiliTelefon: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Banka Adı</label>
                                        <input type="text" className="form-input" value={formData.bankaAdi}
                                            placeholder="Banka Adı"
                                            onChange={(e) => setFormData({ ...formData, bankaAdi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">IBAN No</label>
                                        <input type="text" className="form-input" value={formData.ibanNo}
                                            placeholder="IBAN No"
                                            onChange={(e) => setFormData({ ...formData, ibanNo: e.target.value })} />
                                    </div>
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

            {/* View Modal */}
            {showViewModal && viewingCari && (
                <div className="modal-overlay" onClick={closeViewModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Building2 size={20} /> {viewingCari.firmaAdi}
                            </h2>
                            <button className="modal-close" onClick={closeViewModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                                <div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tip</div>
                                        <span className={`badge ${viewingCari.tip === 'Tedarikci' ? 'badge-info' : 'badge-success'}`}>
                                            {viewingCari.tip === 'Tedarikci' ? 'Tedarikçi' : 'Müşteri'}
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vergi No</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.vergiNo || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vergi Dairesi</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.vergiDairesi || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ticaret Sicil No</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.ticaretSicilNo || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>İl / İlçe</div>
                                        <div style={{ color: 'var(--text-primary)' }}>
                                            {viewingCari.il ? `${viewingCari.il} / ${viewingCari.ilce || '-'}` : '-'}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Adres</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.adres || '-'}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Yetkili Kişi</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.yetkiliKisi || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Yetkili Telefon</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.yetkiliTelefon || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Telefon</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.telefon || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>E-posta</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.email || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Banka Adı</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.bankaAdi || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>IBAN No</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.ibanNo || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {canEdit && (
                                <button type="button" className="btn btn-secondary" onClick={() => { closeViewModal(); handleEdit(viewingCari); }}>
                                    <Edit size={16} style={{ marginRight: '6px' }} /> Düzenle
                                </button>
                            )}
                            <button type="button" className="btn btn-primary" onClick={closeViewModal}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
