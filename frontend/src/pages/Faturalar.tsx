import { useState, useEffect } from 'react';
import { Plus, X, Search, FileText, Trash2, Filter } from 'lucide-react';
import { faturaService, cariService, urunService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Fatura, Cari, Urun, FaturaKalemiCreate } from '../types';

export default function Faturalar() {
    const { hasEntityPermission } = useAuth();
    const [faturalar, setFaturalar] = useState<Fatura[]>([]);
    const [cariler, setCariler] = useState<Cari[]>([]);
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [filterCari, setFilterCari] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [formData, setFormData] = useState({ faturaNo: '', cariId: '', faturaTarihi: '', aciklama: '' });
    const [kalemler, setKalemler] = useState<FaturaKalemiCreate[]>([
        { urunAdi: '', miktar: 1, birimFiyat: 0, indirimOrani: 0, kdvOrani: 18 }
    ]);

    const canAdd = hasEntityPermission('fatura', 'add');

    useEffect(() => {
        loadData();
    }, [filterCari, filterStartDate, filterEndDate]);

    const loadData = async () => {
        try {
            const [faturalarData, carilerData, urunlerData] = await Promise.all([
                faturaService.getAll(),
                cariService.getAll(),
                urunService.getAll()
            ]);

            let data = faturalarData;
            if (filterCari) {
                data = data.filter((f: Fatura) => f.cariId === parseInt(filterCari));
            }
            if (filterStartDate && filterEndDate) {
                data = data.filter((f: Fatura) => f.faturaTarihi >= filterStartDate && f.faturaTarihi <= filterEndDate);
            }
            setFaturalar(data);
            setCariler(carilerData);
            setUrunler(urunlerData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    const addKalem = () => {
        setKalemler([...kalemler, { urunAdi: '', miktar: 1, birimFiyat: 0, indirimOrani: 0, kdvOrani: 18 }]);
    };

    const removeKalem = (index: number) => {
        if (kalemler.length > 1) {
            setKalemler(kalemler.filter((_, i) => i !== index));
        }
    };

    const updateKalem = (index: number, field: string, value: any) => {
        const updated = [...kalemler];
        (updated[index] as any)[field] = value;
        setKalemler(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await faturaService.create({
                faturaNo: formData.faturaNo,
                cariId: parseInt(formData.cariId),
                cariAdi: cariler.find(c => c.id === parseInt(formData.cariId))?.firmaAdi || '',
                faturaTarihi: formData.faturaTarihi,
                aciklama: formData.aciklama || undefined,
                kalemler: kalemler.map((k, i) => ({ ...k, id: i + 1, toplam: k.miktar * k.birimFiyat * (1 - k.indirimOrani / 100) * (1 + k.kdvOrani / 100) })),
            });
            loadData();
            setShowModal(false);
            setFormData({ faturaNo: '', cariId: '', faturaTarihi: '', aciklama: '' });
            setKalemler([{ urunAdi: '', miktar: 1, birimFiyat: 0, indirimOrani: 0, kdvOrani: 18 }]);
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    const clearFilters = () => {
        setFilterCari('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Faturalar</h1>
                    <p>Tüm faturaları görüntüleyin ve yönetin</p>
                </div>
            </header>

            <div className="page-content">
                <div className="toolbar">
                    <button className={`btn ${showFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilter(!showFilter)}>
                        <Filter size={18} /> Filtrele
                    </button>
                    {canAdd && (
                        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Yeni Fatura
                        </button>
                    )}
                </div>

                {/* Filter Panel */}
                {showFilter && (
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                                <label className="form-label">Cari</label>
                                <select className="form-select" value={filterCari} onChange={(e) => setFilterCari(e.target.value)}>
                                    <option value="">Tüm Cariler</option>
                                    {cariler.map((c) => (<option key={c.id} value={c.id}>{c.firmaAdi}</option>))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input type="date" className="form-input" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Bitiş Tarihi</label>
                                <input type="date" className="form-input" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                            </div>
                            <button className="btn btn-secondary" onClick={clearFilters}>Temizle</button>
                        </div>
                    </div>
                )}

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Fatura No</th>
                                <th>Cari</th>
                                <th>Tarih</th>
                                <th>Ara Toplam</th>
                                <th>İndirim</th>
                                <th>KDV</th>
                                <th>Genel Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faturalar.map((fatura) => (
                                <tr key={fatura.id}>
                                    <td style={{ color: 'var(--text-primary)' }}>
                                        <div className="flex items-center gap-md">
                                            <div style={{ width: '36px', height: '36px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-warning)' }}>
                                                <FileText size={18} />
                                            </div>
                                            {fatura.faturaNo}
                                        </div>
                                    </td>
                                    <td>{fatura.cariAdi}</td>
                                    <td>{new Date(fatura.faturaTarihi).toLocaleDateString('tr-TR')}</td>
                                    <td>{formatCurrency(fatura.araToplam)}</td>
                                    <td className="text-error">{formatCurrency(fatura.toplamIndirim)}</td>
                                    <td>{formatCurrency(fatura.toplamKdv)}</td>
                                    <td style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{formatCurrency(fatura.genelToplam)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h2>Yeni Fatura</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-3">
                                    <div className="form-group">
                                        <label className="form-label">Cari *</label>
                                        <select className="form-select" required value={formData.cariId}
                                            onChange={(e) => setFormData({ ...formData, cariId: e.target.value })}>
                                            <option value="">Seçiniz</option>
                                            {cariler.map((c) => (<option key={c.id} value={c.id}>{c.firmaAdi}</option>))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fatura No *</label>
                                        <input type="text" className="form-input" required value={formData.faturaNo}
                                            onChange={(e) => setFormData({ ...formData, faturaNo: e.target.value })} placeholder="FTR-2026-XXX" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tarih *</label>
                                        <input type="date" className="form-input" required value={formData.faturaTarihi}
                                            onChange={(e) => setFormData({ ...formData, faturaTarihi: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                                    <div className="flex justify-between items-center">
                                        <h4>Ürün Kalemleri</h4>
                                        <button type="button" className="btn btn-outline" onClick={addKalem}>
                                            <Plus size={16} /> Kalem Ekle
                                        </button>
                                    </div>
                                </div>

                                {kalemler.map((kalem, index) => (
                                    <div key={index} className="card" style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                            <div className="form-group" style={{ flex: 2, marginBottom: 0, minWidth: '200px' }}>
                                                <label className="form-label">Ürün Adı</label>
                                                <input type="text" className="form-input" value={kalem.urunAdi} required
                                                    onChange={(e) => updateKalem(index, 'urunAdi', e.target.value)} />
                                            </div>
                                            <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: '80px' }}>
                                                <label className="form-label">Miktar</label>
                                                <input type="number" className="form-input" value={kalem.miktar}
                                                    onChange={(e) => updateKalem(index, 'miktar', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: '100px' }}>
                                                <label className="form-label">Birim Fiyat</label>
                                                <input type="number" className="form-input" value={kalem.birimFiyat}
                                                    onChange={(e) => updateKalem(index, 'birimFiyat', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: '80px' }}>
                                                <label className="form-label">İndirim %</label>
                                                <input type="number" className="form-input" value={kalem.indirimOrani}
                                                    onChange={(e) => updateKalem(index, 'indirimOrani', parseFloat(e.target.value))} />
                                            </div>
                                            <div className="form-group" style={{ flex: 1, marginBottom: 0, minWidth: '80px' }}>
                                                <label className="form-label">KDV %</label>
                                                <input type="number" className="form-input" value={kalem.kdvOrani}
                                                    onChange={(e) => updateKalem(index, 'kdvOrani', parseFloat(e.target.value))} />
                                            </div>
                                            <button type="button" className="btn btn-icon btn-danger" onClick={() => removeKalem(index)} disabled={kalemler.length === 1}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={2} value={formData.aciklama}
                                        onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
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
