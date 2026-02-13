import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, FolderTree, Wrench, AlertTriangle, ClipboardList } from 'lucide-react';
import { dashboardService } from '../services/api';
import { Dashboard as DashboardType } from '../types';

export default function Dashboard() {
    const [data, setData] = useState<DashboardType | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const stats = await dashboardService.getStats();
            setData(stats);
        } catch (error) {
            console.error('Dashboard verisi yüklenirken hata:', error);
        }
    };

    if (!data) return null;

    const statCards = [
        { icon: AlertTriangle, label: 'Tamir Bekleyen', value: data.tamirBekleyenSayisi, color: 'error' },
        { icon: Wrench, label: 'Bakımdaki Ürün', value: data.bakimdakiUrunSayisi, color: 'warning' },
        { icon: Users, label: 'Zimmetli Çalışan', value: data.zimmetliCalisanSayisi, color: 'primary', link: '/zimmetler' },
        { icon: Package, label: 'Toplam Stok', value: data.toplamStok, color: 'info', link: '/malzeme-karti' },
        { icon: FolderTree, label: 'Kategori Sayısı', value: data.toplamKategori, color: 'primary', link: '/kategoriler' },
    ];

    const getDurumBadge = (state: number) => {
        switch (state) {
            case 0: return 'badge-success'; // Aktif
            case 1: return 'badge-warning'; // Bakimda
            case 2: return 'badge-error';   // TamirBekliyor
            case 3: return 'badge-neutral'; // Hurda
            case 4: return 'badge-info';    // Zimmetli
            case 5: return 'badge-neutral'; // Pasif
            default: return 'badge-neutral';
        }
    };

    const formatDurum = (state: number) => {
        switch (state) {
            case 0: return 'Aktif';
            case 1: return 'Bakımda';
            case 2: return 'Tamir Bekliyor';
            case 3: return 'Hurda';
            case 4: return 'Zimmetli';
            case 5: return 'Pasif';
            default: return 'Bilinmiyor';
        }
    };

    return (
        <>
            <div className="page-content">
                {/* Stat Cards */}
                <div className="dashboard-grid">
                    {statCards.map((card) => (
                        <div
                            key={card.label}
                            className={`stat-card ${card.color}`}
                            onClick={() => card.link && navigate(card.link)}
                            style={{ cursor: card.link ? 'pointer' : 'default' }}
                        >
                            <div className={`stat-card-icon ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{card.value}</div>
                                <div className="stat-card-label">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detailed Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>

                    {/* Tamir Bekleyen Ürünler */}
                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2 className="dashboard-section-title">
                                <AlertTriangle size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--accent-error)' }} />
                                Tamir Bekleyen Malzemeler
                            </h2>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Malzeme</th>
                                        <th>DMB No</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.tamirBekleyenMalzemeler.length > 0 ? (
                                        data.tamirBekleyenMalzemeler.map((m) => (
                                            <tr key={m.id}>
                                                <td style={{ color: 'var(--text-primary)' }}>{m.ad}</td>
                                                <td>{m.dmbNo || '-'}</td>
                                                <td><span className={`badge ${getDurumBadge(m.state)}`}>{formatDurum(m.state)}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Tamir bekleyen malzeme bulunmuyor
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bakımdaki Ürünler */}
                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2 className="dashboard-section-title">
                                <Wrench size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--accent-warning)' }} />
                                Bakımdaki Malzemeler
                            </h2>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Malzeme</th>
                                        <th>DMB No</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.bakimdakiMalzemeler && data.bakimdakiMalzemeler.length > 0 ? (
                                        data.bakimdakiMalzemeler.map((m) => (
                                            <tr key={m.id}>
                                                <td style={{ color: 'var(--text-primary)' }}>{m.ad}</td>
                                                <td>{m.dmbNo || '-'}</td>
                                                <td><span className={`badge ${getDurumBadge(m.state)}`}>{formatDurum(m.state)}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Bakımda malzeme bulunmuyor
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Son Zimmetler */}
                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2 className="dashboard-section-title">
                                <ClipboardList size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Son Zimmetler
                            </h2>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Ürün</th>
                                        <th>Personel</th>
                                        <th>Tarih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.sonZimmetler.map((zimmet) => (
                                        <tr key={zimmet.id}>
                                            <td style={{ color: 'var(--text-primary)' }}>{zimmet.malzemeAdi}</td>
                                            <td>{zimmet.personelAdi}</td>
                                            <td>{new Date(zimmet.zimmetTarihi).toLocaleDateString('tr-TR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Onaylanan Talepler */}
                    <div className="dashboard-section">
                        <div className="dashboard-section-header">
                            <h2 className="dashboard-section-title">
                                <ClipboardList size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--accent-success)' }} />
                                Son Onaylanan Talepler
                            </h2>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Talep</th>
                                        <th>Onaylayan</th>
                                        <th>Tarih</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.onaylananTalepler && data.onaylananTalepler.length > 0 ? (
                                        data.onaylananTalepler.map((talep) => (
                                            <tr key={talep.id}>
                                                <td style={{ color: 'var(--text-primary)' }}>{talep.baslik}</td>
                                                <td>{talep.onaylayanUserName}</td>
                                                <td>{talep.onayTarihi ? new Date(talep.onayTarihi).toLocaleDateString('tr-TR') : '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Onaylanan talep bulunmuyor
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
