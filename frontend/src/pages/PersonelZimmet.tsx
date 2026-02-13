import { useState, useEffect, useMemo } from 'react';
import { Search, User } from 'lucide-react';
import { personelService, zimmetService } from '../services/api';
import { Personel, Zimmet } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';

export default function PersonelZimmet() {
    const [personeller, setPersoneller] = useState<Personel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPersonelId, setSelectedPersonelId] = useState<number | null>(null);
    const [zimmetler, setZimmetler] = useState<Zimmet[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPersoneller();
    }, []);

    useEffect(() => {
        if (selectedPersonelId) {
            loadZimmetler(selectedPersonelId);
        } else {
            setZimmetler([]);
        }
    }, [selectedPersonelId]);

    const loadPersoneller = async () => {
        try {
            const data = await personelService.getAll();
            setPersoneller(data.filter(p => p.aktif));
        } catch (error) {
            console.error('Personel listesi yüklenemedi:', error);
        }
    };

    const loadZimmetler = async (personelId: number) => {
        setLoading(true);
        try {
            const data = await zimmetService.getByPersonelId(personelId);
            setZimmetler(data);
        } catch (error) {
            console.error('Zimmet listesi yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPersoneller = useMemo(() => {
        if (!searchTerm) return personeller;
        const term = searchTerm.toLowerCase();
        return personeller.filter(p =>
            p.tamAd.toLowerCase().includes(term) ||
            (p.departman && p.departman.toLowerCase().includes(term))
        );
    }, [personeller, searchTerm]);

    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'badge-success';
            case 'Iade': return 'badge-info';
            case 'Kayip': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const columns: Column<Zimmet>[] = useMemo(() => [
        {
            header: 'Malzeme Adı',
            accessor: 'malzemeAdi',
            render: (zimmet: Zimmet) => (
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{zimmet.malzemeAdi}</span>
            )
        },
        {
            header: 'Seri Numarası',
            accessor: 'seriNumarasi',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{zimmet.seriNumarasi || '-'}</span>
            )
        },
        {
            header: 'Barkod',
            accessor: 'barkod',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{zimmet.barkod || '-'}</span>
            )
        },
        {
            header: 'Durum',
            accessor: 'durum',
            render: (zimmet: Zimmet) => (
                <span className={`badge ${getDurumBadge(zimmet.durum)}`}>{zimmet.durum}</span>
            )
        },
        {
            header: 'Bölüm / Oda',
            accessor: 'bolumAdi',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-secondary)' }}>{zimmet.bolumAdi || '-'}</span>
            )
        },
        {
            header: 'Zimmet Tarihi',
            accessor: 'zimmetTarihi',
            render: (zimmet: Zimmet) => new Date(zimmet.zimmetTarihi).toLocaleDateString('tr-TR')
        }
    ], []);

    const selectedPersonel = useMemo(() =>
        personeller.find(p => p.id === selectedPersonelId),
        [personeller, selectedPersonelId]);

    return (
        <div className="page-content" style={{ height: 'calc(100vh - 100px)', padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: '100%', gap: 'var(--spacing-md)' }}>
                {/* SOL PANEL: PERSONEL LİSTESİ */}
                <div style={{
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-primary)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-primary)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                            <User size={18} className="text-primary" />
                            Personel Seçimi
                        </h3>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Personel ara..."
                                style={{ paddingLeft: '32px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredPersoneller.length === 0 ? (
                            <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Personel bulunamadı.
                            </div>
                        ) : (
                            filteredPersoneller.map(personel => (
                                <div
                                    key={personel.id}
                                    onClick={() => setSelectedPersonelId(personel.id)}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border-primary)',
                                        background: selectedPersonelId === personel.id ? 'var(--bg-tertiary)' : 'transparent',
                                        borderLeft: selectedPersonelId === personel.id ? '4px solid var(--primary-500)' : '4px solid transparent',
                                        transition: 'background 0.2s'
                                    }}
                                    className="hover:bg-tertiary"
                                >
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{personel.tamAd}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{personel.departman || '-'}</span>
                                        {personel.zimmetSayisi > 0 && (
                                            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                                                {personel.zimmetSayisi} Zimmet
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SAĞ PANEL: ZİMMET TABLOSU */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-primary)',
                    overflow: 'hidden',
                    padding: 'var(--spacing-md)'
                }}>
                    {!selectedPersonel ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)'
                        }}>
                            <User size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <h3>Personel Seçiniz</h3>
                            <p>Zimmetlerini görüntülemek için soldaki listeden bir personel seçin.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                                        {selectedPersonel.tamAd}
                                    </h2>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                                        {selectedPersonel.departman} • {zimmetler.length} Zimmet Kaydı
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <DataTable
                                    columns={columns}
                                    data={zimmetler}
                                    isLoading={loading}
                                    emptyMessage="Bu personele ait zimmet kaydı bulunmamaktadır."
                                    searchable={false}
                                    paginationParams={{ pageNumber: 1, pageSize: 100 }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
