import { useState, useEffect } from 'react';
import { PlusCircle, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { taleplerService, authService } from '../../services/mockData';
import { Talep, TalepCreate, TalepTipi } from '../../types';

export default function TalepOlustur() {
    const [myTalepler, setMyTalepler] = useState<Talep[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        talepTipi: 'CariEkleme' as TalepTipi,
        baslik: '',
        detaylar: '',
        talepData: {} as Record<string, string>
    });

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        if (currentUser) {
            setMyTalepler(taleplerService.getByUser(currentUser.id));
        }
    }, []);

    const talepTipleri = [
        { value: 'CariEkleme', label: 'Cari Ekleme', fields: ['firmaAdi', 'tip', 'vergiNo', 'il'] },
        { value: 'DepoEkleme', label: 'Depo Ekleme', fields: ['ad', 'aciklama'] },
        { value: 'KategoriEkleme', label: 'Kategori Ekleme', fields: ['ad', 'aciklama'] },
    ];

    const selectedTip = talepTipleri.find(t => t.value === formData.talepTipi);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        const talepCreate: TalepCreate = {
            talepTipi: formData.talepTipi,
            talepEdenUserId: currentUser.id,
            baslik: formData.baslik,
            detaylar: formData.detaylar,
            talepData: JSON.stringify(formData.talepData)
        };

        taleplerService.create(talepCreate);
        setMyTalepler(taleplerService.getByUser(currentUser.id));
        setShowForm(false);
        setFormData({
            talepTipi: 'CariEkleme',
            baslik: '',
            detaylar: '',
            talepData: {}
        });
    };

    const handleDataFieldChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            talepData: { ...prev.talepData, [field]: value }
        }));
    };

    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Beklemede': return 'badge-warning';
            case 'Onaylandi': return 'badge-success';
            case 'Reddedildi': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const getDurumIcon = (durum: string) => {
        switch (durum) {
            case 'Beklemede': return <Clock size={14} />;
            case 'Onaylandi': return <CheckCircle size={14} />;
            case 'Reddedildi': return <XCircle size={14} />;
            default: return null;
        }
    };

    const formatDurum = (durum: string) => {
        switch (durum) {
            case 'Onaylandi': return 'Onaylandı';
            case 'Reddedildi': return 'Reddedildi';
            default: return durum;
        }
    };

    const getFieldLabel = (field: string) => {
        switch (field) {
            case 'firmaAdi': return 'Firma Adı';
            case 'tip': return 'Tip';
            case 'vergiNo': return 'Vergi No';
            case 'il': return 'İl';
            case 'ad': return 'Ad';
            case 'aciklama': return 'Açıklama';
            default: return field;
        }
    };

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>
                        <PlusCircle size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                        Talep Oluştur
                    </h1>
                    <p>Yeni ekleme/düzenleme talepleri oluşturun</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <PlusCircle size={18} />
                        <span>Yeni Talep</span>
                    </button>
                )}
            </header>

            <div className="page-content">
                {/* Info Banner */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)', backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-info)' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        <strong>Bilgi:</strong> Yetkisiz olduğunuz işlemler için talep oluşturabilirsiniz.
                        Talepleriniz yönetici tarafından onaylandığında işlem gerçekleştirilecektir.
                    </p>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-lg)' }}>Yeni Talep Oluştur</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Talep Tipi *</label>
                                    <select
                                        className="form-input"
                                        value={formData.talepTipi}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            talepTipi: e.target.value as TalepTipi,
                                            talepData: {}
                                        })}
                                        required
                                    >
                                        {talepTipleri.map(tip => (
                                            <option key={tip.value} value={tip.value}>{tip.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Başlık *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.baslik}
                                        onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                                        placeholder="Talebinizi özetleyin"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Detaylı Açıklama *</label>
                                <textarea
                                    className="form-input"
                                    value={formData.detaylar}
                                    onChange={(e) => setFormData({ ...formData, detaylar: e.target.value })}
                                    placeholder="Talebinizin nedenini ve detaylarını açıklayın"
                                    rows={3}
                                    required
                                />
                            </div>

                            {selectedTip && (
                                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                                    <h4 style={{ margin: '0 0 var(--spacing-md)', fontSize: '0.875rem' }}>
                                        {selectedTip.label} Bilgileri
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                                        {selectedTip.fields.map(field => (
                                            <div key={field} className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">{getFieldLabel(field)}</label>
                                                {field === 'tip' ? (
                                                    <select
                                                        className="form-input"
                                                        value={formData.talepData[field] || ''}
                                                        onChange={(e) => handleDataFieldChange(field, e.target.value)}
                                                    >
                                                        <option value="">Seçin</option>
                                                        <option value="Tedarikci">Tedarikçi</option>
                                                        <option value="Musteri">Müşteri</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={formData.talepData[field] || ''}
                                                        onChange={(e) => handleDataFieldChange(field, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Send size={18} />
                                    <span>Talep Gönder</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* My Requests */}
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-lg)' }}>Taleplerim</h3>
                    {myTalepler.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Başlık</th>
                                        <th>Tip</th>
                                        <th>Tarih</th>
                                        <th>Durum</th>
                                        <th>Not</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTalepler.map((talep) => (
                                        <tr key={talep.id}>
                                            <td>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                                    {talep.baslik}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {talepTipleri.find(t => t.value === talep.talepTipi)?.label || talep.talepTipi}
                                                </span>
                                            </td>
                                            <td>{new Date(talep.olusturmaTarihi).toLocaleDateString('tr-TR')}</td>
                                            <td>
                                                <span className={`badge ${getDurumBadge(talep.durum)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    {getDurumIcon(talep.durum)}
                                                    {formatDurum(talep.durum)}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', maxWidth: '200px' }}>
                                                {talep.redNedeni ||
                                                    (talep.durum === 'Onaylandi' ? `Onaylayan: ${talep.onaylayanUserName}` : '-')
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                            <PlusCircle size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
                            <p>Henüz bir talebiniz bulunmuyor.</p>
                            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 'var(--spacing-md)' }}>
                                <PlusCircle size={18} />
                                <span>İlk Talebinizi Oluşturun</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
