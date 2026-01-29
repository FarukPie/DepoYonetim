import { useEffect, useState } from 'react';
import { FileCheck, Check, X, Eye, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';
import { taleplerService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Talep } from '../../types';

export default function Talepler() {
    const { user } = useAuth();
    const [talepler, setTalepler] = useState<Talep[]>([]);
    const [durumFilter, setDurumFilter] = useState<string>('');
    const [selectedTalep, setSelectedTalep] = useState<Talep | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [redNedeni, setRedNedeni] = useState('');

    useEffect(() => {
        loadData();
    }, [durumFilter]);

    const loadData = async () => {
        try {
            const data = await taleplerService.getAll(durumFilter || undefined);
            setTalepler(data);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const handleOnayla = async (talep: Talep) => {
        if (user) {
            try {
                await taleplerService.onayla(talep.id, user.id);
                loadData();
                setSelectedTalep(null);
            } catch (error) {
                console.error('Onaylama hatası:', error);
                alert('Onaylama sırasında bir hata oluştu.');
            }
        }
    };

    const handleReddet = async () => {
        if (!selectedTalep || !redNedeni.trim()) return;
        if (user) {
            try {
                await taleplerService.reddet(selectedTalep.id, user.id, redNedeni);
                loadData();
                setSelectedTalep(null);
                setShowRejectModal(false);
                setRedNedeni('');
            } catch (error) {
                console.error('Reddetme hatası:', error);
                alert('Reddetme sırasında bir hata oluştu.');
            }
        }
    };

    const openRejectModal = (talep: Talep) => {
        setSelectedTalep(talep);
        setShowRejectModal(true);
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

    const getTalepTipiLabel = (tip: string) => {
        switch (tip) {
            case 'CariEkleme': return 'Cari Ekleme';
            case 'CariDuzenleme': return 'Cari Düzenleme';
            case 'CariSilme': return 'Cari Silme';
            case 'DepoEkleme': return 'Depo Ekleme';
            case 'DepoDuzenleme': return 'Depo Düzenleme';
            case 'DepoSilme': return 'Depo Silme';
            case 'KategoriEkleme': return 'Kategori Ekleme';
            case 'KategoriDuzenleme': return 'Kategori Düzenleme';
            case 'KategoriSilme': return 'Kategori Silme';
            case 'Bakim': return 'Bakım Talebi';
            case 'Tamir': return 'Tamir Talebi';
            default: return tip;
        }
    };

    const formatTalepData = (dataStr: string) => {
        try {
            const data = JSON.parse(dataStr);
            return Object.entries(data).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '4px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{key}:</strong> {String(value)}
                </div>
            ));
        } catch {
            return dataStr;
        }
    };

    const bekleyenSayisi = talepler.filter(t => t.durum === 'Beklemede').length;

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>
                        <FileCheck size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                        Talepler
                        {bekleyenSayisi > 0 && (
                            <span className="badge badge-warning" style={{ marginLeft: '12px', fontSize: '0.875rem' }}>
                                {bekleyenSayisi} Beklemede
                            </span>
                        )}
                    </h1>
                    <p>Kullanıcı taleplerini yönetin</p>
                </div>
            </header>

            <div className="page-content">
                {/* Filter */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                        <select
                            className="form-input"
                            value={durumFilter}
                            onChange={(e) => setDurumFilter(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="">Tüm Durumlar</option>
                            <option value="Beklemede">Beklemede</option>
                            <option value="Onaylandi">Onaylandı</option>
                            <option value="Reddedildi">Reddedildi</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Talep</th>
                                    <th>Tip</th>
                                    <th>Talep Eden</th>
                                    <th>Tarih</th>
                                    <th>Durum</th>
                                    <th style={{ textAlign: 'right' }}>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {talepler.length > 0 ? (
                                    talepler.map((talep) => (
                                        <tr key={talep.id}>
                                            <td>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                                    {talep.baslik}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {talep.detaylar.substring(0, 50)}{talep.detaylar.length > 50 ? '...' : ''}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">{getTalepTipiLabel(talep.talepTipi)}</span>
                                            </td>
                                            <td>{talep.talepEdenUserName}</td>
                                            <td>{new Date(talep.olusturmaTarihi).toLocaleDateString('tr-TR')}</td>
                                            <td>
                                                <span className={`badge ${getDurumBadge(talep.durum)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    {getDurumIcon(talep.durum)}
                                                    {formatDurum(talep.durum)}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-xs)' }}>
                                                    <button
                                                        className="btn btn-outline"
                                                        onClick={() => setSelectedTalep(talep)}
                                                        title="Detay"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {talep.durum === 'Beklemede' && (
                                                        <>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => handleOnayla(talep)}
                                                                title="Onayla"
                                                                style={{ padding: '8px 12px' }}
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-outline"
                                                                onClick={() => openRejectModal(talep)}
                                                                title="Reddet"
                                                                style={{ color: 'var(--accent-error)' }}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                                            Talep bulunamadı
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedTalep && !showRejectModal && (
                <div className="modal-overlay" onClick={() => setSelectedTalep(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Talep Detayı</h2>
                            <button className="btn btn-outline" onClick={() => setSelectedTalep(null)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Başlık</label>
                                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedTalep.baslik}</div>
                            </div>
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detaylar</label>
                                <div>{selectedTalep.detaylar}</div>
                            </div>
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Talep Edilen Veri</label>
                                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                                    {formatTalepData(selectedTalep.talepData)}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Talep Eden</label>
                                    <div>{selectedTalep.talepEdenUserName}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tarih</label>
                                    <div>{new Date(selectedTalep.olusturmaTarihi).toLocaleString('tr-TR')}</div>
                                </div>
                            </div>
                            {selectedTalep.durum !== 'Beklemede' && (
                                <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-primary)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>İşlemi Yapan</label>
                                            <div>{selectedTalep.onaylayanUserName}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>İşlem Tarihi</label>
                                            <div>{selectedTalep.onayTarihi ? new Date(selectedTalep.onayTarihi).toLocaleString('tr-TR') : '-'}</div>
                                        </div>
                                    </div>
                                    {selectedTalep.redNedeni && (
                                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Red Nedeni</label>
                                            <div style={{ color: 'var(--accent-error)' }}>{selectedTalep.redNedeni}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            {selectedTalep.durum === 'Beklemede' ? (
                                <>
                                    <button className="btn btn-outline" onClick={() => openRejectModal(selectedTalep)} style={{ color: 'var(--accent-error)' }}>
                                        <X size={18} />
                                        <span>Reddet</span>
                                    </button>
                                    <button className="btn btn-primary" onClick={() => handleOnayla(selectedTalep)}>
                                        <Check size={18} />
                                        <span>Onayla</span>
                                    </button>
                                </>
                            ) : (
                                <button className="btn btn-outline" onClick={() => setSelectedTalep(null)}>
                                    Kapat
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedTalep && (
                <div className="modal-overlay" onClick={() => { setShowRejectModal(false); setRedNedeni(''); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Talep Reddet</h2>
                            <button className="btn btn-outline" onClick={() => { setShowRejectModal(false); setRedNedeni(''); }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 'var(--spacing-md)' }}>
                                <strong>"{selectedTalep.baslik}"</strong> talebini reddetmek istediğinize emin misiniz?
                            </p>
                            <div className="form-group">
                                <label className="form-label">Red Nedeni *</label>
                                <textarea
                                    className="form-input"
                                    value={redNedeni}
                                    onChange={(e) => setRedNedeni(e.target.value)}
                                    placeholder="Red nedenini açıklayın..."
                                    rows={3}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => { setShowRejectModal(false); setRedNedeni(''); }}>
                                İptal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleReddet}
                                disabled={!redNedeni.trim()}
                                style={{ backgroundColor: 'var(--accent-error)' }}
                            >
                                <X size={18} />
                                <span>Reddet</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
