import { useEffect, useState } from 'react';
import { Users, Package, FolderTree, Wrench, AlertTriangle, ClipboardList } from 'lucide-react';
import { dashboardService } from '../services/api';
import { Dashboard as DashboardType } from '../types';

export default function Dashboard() {
    const [data, setData] = useState<DashboardType | null>(null);

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
        { icon: Users, label: 'Zimmetli Çalışan', value: data.zimmetliCalisanSayisi, color: 'primary' },
        { icon: Package, label: 'Toplam Stok', value: data.toplamStok, color: 'info' },
        { icon: FolderTree, label: 'Kategori Sayısı', value: data.toplamKategori, color: 'primary' },
        { icon: Wrench, label: 'Bakımdaki Ürün', value: data.bakimdakiUrunSayisi, color: 'warning' },
        { icon: AlertTriangle, label: 'Tamir Bekleyen', value: data.tamirBekleyenSayisi, color: 'error' },
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
            <header className="page-header">
                <h1>Dashboard</h1>
                <p>Can Hastanesi envanter durumu genel özeti</p>
            </header>

            <div className="page-content">
                {/* Stat Cards */}
                <div className="dashboard-grid">
                    {statCards.map((card) => (
                        <div key={card.label} className="stat-card">
                            <div className={`stat-card-icon ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <div className="stat-card-value">{card.value}</div>
                            <div className="stat-card-label">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Assignments & Repair Items */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
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
                </div>
            </div>
        </>
    );
}
