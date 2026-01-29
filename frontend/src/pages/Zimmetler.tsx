import { useEffect, useState } from 'react';
import { ClipboardList, Search, Filter } from 'lucide-react';
import { zimmetService } from '../services/api';
import { Zimmet } from '../types';

export default function Zimmetler() {
    const [zimmetler, setZimmetler] = useState<Zimmet[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [durumFilter, setDurumFilter] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await zimmetService.getAll();
            setZimmetler(data);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const filteredZimmetler = zimmetler.filter(z => {
        const matchesSearch = z.urunAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            z.personelAdi.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDurum = !durumFilter || z.durum === durumFilter;
        return matchesSearch && matchesDurum;
    });

    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'badge-success';
            case 'Iade': return 'badge-info';
            case 'Kayip': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>
                        <ClipboardList size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                        Zimmetler
                    </h1>
                    <p>Personele zimmetlenen ürünlerin listesi</p>
                </div>
            </header>

            <div className="page-content">
                {/* Filters */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                            <Search style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                                width: '18px',
                                height: '18px'
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ürün veya personel ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                            <select
                                className="form-input"
                                value={durumFilter}
                                onChange={(e) => setDurumFilter(e.target.value)}
                                style={{ minWidth: '150px' }}
                            >
                                <option value="">Tüm Durumlar</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Iade">İade</option>
                                <option value="Kayip">Kayıp</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                    <div className="stat-card">
                        <div className="stat-card-value">{zimmetler.length}</div>
                        <div className="stat-card-label">Toplam Zimmet</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-success)' }}>
                            {zimmetler.filter(z => z.durum === 'Aktif').length}
                        </div>
                        <div className="stat-card-label">Aktif Zimmet</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-info)' }}>
                            {zimmetler.filter(z => z.durum === 'Iade').length}
                        </div>
                        <div className="stat-card-label">İade Edilmiş</div>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ürün</th>
                                    <th>Personel</th>
                                    <th>Zimmet Tarihi</th>
                                    <th>İade Tarihi</th>
                                    <th>Durum</th>
                                    <th>Açıklama</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredZimmetler.length > 0 ? (
                                    filteredZimmetler.map((zimmet) => (
                                        <tr key={zimmet.id}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                                {zimmet.urunAdi}
                                            </td>
                                            <td>{zimmet.personelAdi}</td>
                                            <td>{new Date(zimmet.zimmetTarihi).toLocaleDateString('tr-TR')}</td>
                                            <td>
                                                {zimmet.iadeTarihi
                                                    ? new Date(zimmet.iadeTarihi).toLocaleDateString('tr-TR')
                                                    : '-'
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge ${getDurumBadge(zimmet.durum)}`}>
                                                    {zimmet.durum}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {zimmet.aciklama || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                                            {searchTerm || durumFilter
                                                ? 'Arama kriterlerine uygun zimmet bulunamadı'
                                                : 'Henüz zimmet kaydı bulunmuyor'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
