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
        { icon: Package, label: 'Toplam Stok', value: data.toplamStok, color: 'info', link: '/urunler' },
        { icon: FolderTree, label: 'Kategori Sayısı', value: data.toplamKategori, color: 'primary', link: '/kategoriler' },
    ];

    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'badge-success';
            case 'Bakimda': return 'badge-warning';
            case 'TamirBekliyor': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const formatDurum = (durum: string) => {
        switch (durum) {
            case 'TamirBekliyor': return 'Tamir Bekliyor';
            case 'Bakimda': return 'Bakımda';
            default: return durum;
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
                                Tamir Bekleyen Ürünler
                            </h2>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Ürün</th>
                                        <th>Depo</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.tamirBekleyenUrunler.length > 0 ? (
                                        data.tamirBekleyenUrunler.map((urun) => (
                                            <tr key={urun.id}>
                                                <td style={{ color: 'var(--text-primary)' }}>{urun.ad}</td>
                                                <td>{urun.depoAdi}</td>
                                                <td><span className={`badge ${getDurumBadge(urun.durum)}`}>{formatDurum(urun.durum)}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Tamir bekleyen ürün bulunmuyor
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
                                Bakımdaki Ürünler
                            </h2>
                        </div>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Ürün</th>
                                        <th>Depo</th>
                                        <th>Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.bakimdakiUrunler && data.bakimdakiUrunler.length > 0 ? (
                                        data.bakimdakiUrunler.map((urun) => (
                                            <tr key={urun.id}>
                                                <td style={{ color: 'var(--text-primary)' }}>{urun.ad}</td>
                                                <td>{urun.depoAdi}</td>
                                                <td><span className={`badge ${getDurumBadge(urun.durum)}`}>{formatDurum(urun.durum)}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                Bakımda ürün bulunmuyor
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
                                            <td style={{ color: 'var(--text-primary)' }}>{zimmet.urunAdi}</td>
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
