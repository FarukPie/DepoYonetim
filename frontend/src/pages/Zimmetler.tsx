import { useEffect, useState, useMemo, Fragment, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, CheckCircle, RotateCcw, Edit, Trash2, X, AlertTriangle, Search, Plus, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { zimmetService, faturaService, personelService, bolumService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zimmet, FaturaKalemi, Fatura } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Zimmetler() {
    const [showModal, setShowModal] = useState(false);
    const [viewingZimmet, setViewingZimmet] = useState<Zimmet | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [zimmetler, setZimmetler] = useState<Zimmet[]>([]);
    const [faturaKalemleri, setFaturaKalemleri] = useState<FaturaKalemi[]>([]);
    const [personeller, setPersoneller] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]); // New: Locations
    const [flatLocations, setFlatLocations] = useState<any[]>([]); // New: Flat Locations

    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [durumFilter, setDurumFilter] = useState<string>('');

    // Product Selection Modal States
    const [showProductModal, setShowProductModal] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

    // New: Show assigned products toggle
    const [showAssigned, setShowAssigned] = useState(false);

    // New: Reassignment Confirmation
    const [showReassignConfirm, setShowReassignConfirm] = useState(false);

    // New: Expanded Product Details Index
    const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [debugError, setDebugError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        isPersonelTarget: true,
        isBolumTarget: false,
        personelId: '',
        bolumId: '',
        zimmetTarihi: new Date().toISOString().split('T')[0],
        aciklama: '',
        durum: 'Aktif'
    });

    const [selectedProducts, setSelectedProducts] = useState<FaturaKalemi[]>([]); // Selected FaturaKalemi items for batch add

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const { hasEntityPermission } = useAuth();
    const canAdd = hasEntityPermission('zimmet', 'add');
    const canEdit = hasEntityPermission('zimmet', 'edit');
    const canDelete = hasEntityPermission('zimmet', 'delete');

    // Initial load for lookups
    useEffect(() => {
        const loadLookups = async () => {
            try {
                const [faturaData, personelData, locationTree] = await Promise.all([
                    faturaService.getAll(),
                    personelService.getAll(),
                    bolumService.getTree()
                ]);

                // Flatten all fatura kalemleri
                const allKalemler: FaturaKalemi[] = [];
                if (Array.isArray(faturaData)) {
                    faturaData.forEach((fatura: Fatura) => {
                        if (fatura.kalemler) {
                            fatura.kalemler.forEach(k => {
                                allKalemler.push(k);
                            });
                        }
                    });
                }
                setFaturaKalemleri(allKalemler);
                setPersoneller(Array.isArray(personelData) ? personelData : []);
                setLocations(Array.isArray(locationTree) ? locationTree : []);

                // Flatten locations
                const flatten = (locs: any[], level = 0): any[] => {
                    let result: any[] = [];
                    for (const loc of locs) {
                        result.push({ ...loc, level });
                        if (loc.subLocations) {
                            result = result.concat(flatten(loc.subLocations, level + 1));
                        }
                    }
                    return result;
                };
                setFlatLocations(flatten(Array.isArray(locationTree) ? locationTree : []));
            } catch (error) {
                console.error('Lookup yükleme hatası:', error);
            }
        };
        loadLookups();
    }, []);

    // Data load for grid
    useEffect(() => {
        loadData(page, pageSize, searchTerm, durumFilter);
    }, [page, pageSize]); // searchTerm and durumFilter managed manually or via specific handlers

    const loadData = async (currentPage: number, currentPageSize: number, search: string, durum: string) => {
        setIsLoading(true);
        try {
            const result = await zimmetService.getPaged(currentPage, currentPageSize, search, durum);
            setZimmetler(result.items);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            setDebugError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    // Ref to track if fatura items have been processed
    const processedFaturaItems = useRef(false);

    // Handle incoming items from Fatura
    useEffect(() => {
        // Only process once per navigation
        if (location.state?.assignItems && faturaKalemleri.length > 0 && !processedFaturaItems.current) {
            const items = location.state.assignItems;

            // Map fatura items to FaturaKalemi objects
            const productsToAssign = items.map((item: any) => {
                const found = faturaKalemleri.find(fk => fk.id === item.faturaKalemiId);
                return found || { id: item.faturaKalemiId, malzemeAdi: item.malzemeAdi } as FaturaKalemi;
            });

            // Filter out any potential invalid items
            const validProducts = productsToAssign.filter((p: any) => p.id);

            if (validProducts.length > 0) {
                console.log('Faturadan gelen ürünler:', validProducts);
                const uniqueProducts: FaturaKalemi[] = [];
                const seenIds = new Set();

                for (const p of validProducts) {
                    if (!seenIds.has(p.id)) {
                        uniqueProducts.push(p);
                        seenIds.add(p.id);
                    }
                }

                setSelectedProducts(uniqueProducts);
                setSelectedProductIds(seenIds as Set<number>);

                setFormData(prev => ({
                    ...prev,
                    aciklama: 'Faturadan otomatik aktarıldı',
                    isPersonelTarget: true,
                    isBolumTarget: false,
                    personelId: '',
                    bolumId: '',
                    zimmetTarihi: new Date().toISOString().split('T')[0],
                    durum: 'Aktif'
                }));

                setEditingId(null);
                setShowModal(true);

                // Mark as processed to prevent reopening
                processedFaturaItems.current = true;

                // Clear navigation state
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, faturaKalemleri]);

    const getDurumBadge = (durum: string) => {
        switch (durum) {
            case 'Aktif': return 'badge-success';
            case 'Iade': return 'badge-info';
            case 'Kayip': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const handleEdit = (zimmet: Zimmet) => {
        setEditingId(zimmet.id);
        const urun = faturaKalemleri.find(fk => fk.id === zimmet.faturaKalemiId);

        const isPersonel = !!zimmet.personelId;
        const isBolum = !!zimmet.bolumId;

        setFormData({
            isPersonelTarget: isPersonel,
            isBolumTarget: isBolum,
            personelId: zimmet.personelId?.toString() || '',
            bolumId: zimmet.bolumId?.toString() || '',
            zimmetTarihi: zimmet.zimmetTarihi.split('T')[0],
            aciklama: zimmet.aciklama || '',
            durum: zimmet.durum
        });

        if (urun) {
            setSelectedProducts([urun]);
        }

        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId === null) return;
        try {
            await zimmetService.delete(deleteTargetId);
            loadData(page, pageSize, searchTerm, durumFilter);
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedProducts.length === 0) {
            alert('Lütfen en az bir malzeme seçiniz.');
            return;
        }

        if (!formData.isPersonelTarget && !formData.isBolumTarget) {
            alert('Lütfen en az bir hedef (Personel veya Bölüm) seçiniz.');
            return;
        }

        if (formData.isPersonelTarget && !formData.personelId) {
            alert('Personel seçimi yapmadınız.');
            return;
        }

        if (formData.isBolumTarget && !formData.bolumId) {
            alert('Bölüm/Oda seçimi yapmadınız.');
            return;
        }

        // Check validation for reassignment (zimmetDurum = true)
        const assignedProducts = selectedProducts.filter(p => p.zimmetDurum === true);
        if (assignedProducts.length > 0) {
            setShowReassignConfirm(true);
            return;
        }

        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            if (editingId) {
                // Update Single
                if (selectedProducts.length !== 1) {
                    alert("Düzenleme modunda sadece 1 malzeme seçili olmalıdır.");
                    return;
                }
                const data = {
                    faturaKalemiId: selectedProducts[0].id,
                    personelId: formData.isPersonelTarget ? parseInt(formData.personelId) : undefined,
                    bolumId: formData.isBolumTarget ? parseInt(formData.bolumId) : undefined,
                    zimmetTarihi: formData.zimmetTarihi,
                    aciklama: formData.aciklama,
                    durum: formData.durum
                };
                await zimmetService.update(editingId, data);
            } else {
                // Create Multiple
                for (const product of selectedProducts) {
                    const data = {
                        faturaKalemiId: product.id,
                        personelId: formData.isPersonelTarget ? parseInt(formData.personelId) : undefined,
                        bolumId: formData.isBolumTarget ? parseInt(formData.bolumId) : undefined,
                        zimmetTarihi: formData.zimmetTarihi,
                        aciklama: formData.aciklama
                    };
                    await zimmetService.create(data);
                }
            }

            loadData(page, pageSize, searchTerm, durumFilter);
            closeModal();
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        } finally {
            setShowSaveConfirm(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            isPersonelTarget: true,
            isBolumTarget: false,
            personelId: '',
            bolumId: '',
            zimmetTarihi: new Date().toISOString().split('T')[0],
            aciklama: '',
            durum: 'Aktif'
        });
        setSelectedProducts([]);
        setSelectedProductIds(new Set());
    };

    // --- Product Selection Logic (FaturaKalemi based) ---
    const activeProducts = useMemo(() => {
        return faturaKalemleri.filter(fk => {
            // Edit mode: always show currently selected product
            if (editingId && selectedProducts.some(sp => sp.id === fk.id)) return true;

            // showAssigned: show all items including zimmetli ones
            if (showAssigned) return true;

            // Default: Show ONLY zimmetsiz (zimmetDurum = false)
            return !fk.zimmetDurum;
        });
    }, [faturaKalemleri, editingId, selectedProducts, showAssigned]);

    const filteredProducts = useMemo(() => {
        if (!productSearchTerm.trim()) {
            return [];
        }
        return activeProducts.filter(fk => {
            const searchLower = productSearchTerm.toLowerCase();
            const matchesName = fk.malzemeAdi.toLowerCase().includes(searchLower);
            const matchesSeri = fk.seriNumarasi?.toLowerCase().includes(searchLower) || false;
            const matchesBarkod = fk.barkod?.toLowerCase().includes(searchLower) || false;
            return matchesName || matchesSeri || matchesBarkod;
        });
    }, [activeProducts, productSearchTerm]);

    const toggleProductSelection = (id: number) => {
        const newSelected = new Set(selectedProductIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProductIds(newSelected);
    };

    const addSelectedProducts = () => {
        const productsToAdd = faturaKalemleri.filter(fk => selectedProductIds.has(fk.id));
        finalizeAddProducts(productsToAdd);
    };

    const finalizeAddProducts = (products: FaturaKalemi[]) => {
        const newSelection = [...selectedProducts];
        products.forEach(p => {
            if (!newSelection.find(existing => existing.id === p.id)) {
                newSelection.push(p);
            }
        });
        setSelectedProducts(newSelection);
        setShowProductModal(false);
        setProductSearchTerm('');
        setSelectedProductIds(new Set());
        setShowReassignConfirm(false);
    };

    const removeSelectedProduct = (id: number) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    };

    // Memoize columns to prevent DataTable re-renders
    const columns: Column<Zimmet>[] = useMemo(() => [
        {
            header: 'Malzeme Adı',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {zimmet.malzemeAdi}
                </span>
            )
        },
        {
            header: 'Seri Numarası',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-secondary)' }}>
                    {zimmet.seriNumarasi || '-'}
                </span>
            )
        },
        {
            header: 'Barkod',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-secondary)' }}>
                    {zimmet.barkod || '-'}
                </span>
            )
        },
        {
            header: 'Durum',
            render: (zimmet: Zimmet) => (
                <span className={`badge ${getDurumBadge(zimmet.durum)} `}>
                    {zimmet.durum}
                </span>
            )
        },
        {
            header: 'Personel',
            render: (zimmet: Zimmet) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {zimmet.personelAdi ? (
                        <>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{zimmet.personelAdi}</span>
                            {zimmet.personelDepartman && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{zimmet.personelDepartman}</span>
                            )}
                        </>
                    ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                </div>
            )
        },
        {
            header: 'Bölüm / Oda',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-secondary)' }}>
                    {zimmet.bolumAdi || '-'}
                </span>
            )
        },
        {
            header: 'Zimmet Tarihi',
            render: (zimmet: Zimmet) => new Date(zimmet.zimmetTarihi).toLocaleDateString('tr-TR')
        },
        ...((canEdit || canDelete) ? [{
            header: 'İşlemler',
            render: (zimmet: Zimmet) => (
                <div className="flex gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(zimmet)}>
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(zimmet.id)}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }] : [])
    ], [canEdit, canDelete]);

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
        loadData(1, pageSize, term, durumFilter);
    };

    const handleDurumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDurum = e.target.value;
        setDurumFilter(newDurum);
        setPage(1);
        loadData(1, pageSize, searchTerm, newDurum);
    };

    return (
        <>
            <div className="page-content">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                    Zimmetler
                </h1>

                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                    {/* Stats Grid */}
                    <div className="dashboard-grid" style={{ flex: 1, marginBottom: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }}>
                        <div className="stat-card">
                            <div className="stat-card-icon"><ClipboardList size={24} style={{ color: 'var(--text-muted)' }} /></div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{zimmetler.length}</div>
                                <div className="stat-card-label">Toplam Zimmet</div>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-card-icon success"><CheckCircle size={24} /></div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{zimmetler.filter(z => z.durum === 'Aktif').length}</div>
                                <div className="stat-card-label">Aktif Zimmet</div>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <div className="stat-card-icon info"><Package size={24} /></div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{faturaKalemleri.filter(k => !k.zimmetDurum).length}</div>
                                <div className="stat-card-label">Zimmetli Olmayan</div>
                            </div>
                        </div>
                        <div className="stat-card error">
                            <div className="stat-card-icon error"><AlertTriangle size={24} /></div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{zimmetler.filter(z => z.durum === 'Kayip').length}</div>
                                <div className="stat-card-label">Kayıp</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', width: '300px', flexShrink: 0 }}>
                        <div className="search-box" style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Malzeme, Personel veya Bölüm ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input" style={{ paddingLeft: '36px', width: '100%' }} />
                        </div>
                        {canAdd && (
                            <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormData({ ...formData, durum: 'Aktif' }); setSelectedProducts([]); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', width: '100%' }}>
                                <Plus size={18} /> Zimmet Ekle
                            </button>
                        )}
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={zimmetler}
                    emptyMessage="Zimmet kaydı bulunamadı."
                    title="Zimmetler"
                    searchable={true}
                    onSearch={handleSearch}
                    searchPlaceholder="Malzeme, Personel veya Bölüm ara..."
                    onAdd={canAdd ? () => { setShowModal(true); setFormData({ ...formData, durum: 'Aktif' }); setSelectedProducts([]); } : undefined}
                    addButtonLabel="Zimmet Ekle"
                    extraToolbarContent={
                        <div className="flex gap-sm items-center">
                            <select className="form-select form-select-sm" value={durumFilter} onChange={handleDurumChange} style={{ minWidth: '120px' }}>
                                <option value="">Tüm Durumlar</option>
                                <option value="Aktif">Aktif</option>
                                <option value="Iade">İade</option>
                                <option value="Kayip">Kayıp</option>
                            </select>
                        </div>
                    }
                    onRowClick={(zimmet) => setViewingZimmet(zimmet)}
                    rowClickable={true}
                    serverSide={true}
                    totalCount={totalCount}
                    paginationParams={{ pageNumber: page, pageSize }}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Zimmet Düzenle' : 'Zimmet Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hedef Seçimi</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <input type="checkbox" checked={formData.isPersonelTarget} onChange={(e) => setFormData({ ...formData, isPersonelTarget: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                                                <span>👤 Personel</span>
                                            </label>
                                            <select className="form-select form-select-sm" value={formData.personelId} onChange={(e) => setFormData({ ...formData, personelId: e.target.value })} disabled={!formData.isPersonelTarget} style={{ padding: '6px 12px', opacity: formData.isPersonelTarget ? 1 : 0.6 }}>
                                                <option value="">Personel Seçiniz...</option>
                                                {personeller.map((p) => (<option key={p.id} value={p.id}>{p.tamAd}</option>))}
                                            </select>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', alignItems: 'center' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <input type="checkbox" checked={formData.isBolumTarget} onChange={(e) => setFormData({ ...formData, isBolumTarget: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                                                <span>📍 Bölüm/Oda</span>
                                            </label>
                                            <select className="form-select form-select-sm" value={formData.bolumId} onChange={(e) => setFormData({ ...formData, bolumId: e.target.value })} disabled={!formData.isBolumTarget} style={{ padding: '6px 12px', opacity: formData.isBolumTarget ? 1 : 0.6 }}>
                                                <option value="">Bölüm Seçiniz...</option>
                                                {flatLocations.map((loc) => (<option key={loc.id} value={loc.id}>{loc.name}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.85rem' }}>Zimmet Tarihi</label>
                                        <input type="date" className="form-input form-input-sm" required value={formData.zimmetTarihi} onChange={(e) => setFormData({ ...formData, zimmetTarihi: e.target.value })} style={{ padding: '6px 12px' }} />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.85rem' }}>Durum</label>
                                        <select className="form-select form-select-sm" value={formData.durum} onChange={(e) => setFormData({ ...formData, durum: e.target.value })} style={{ padding: '6px 12px' }}>
                                            <option value="Aktif">Aktif</option>
                                            <option value="Iade">İade</option>
                                            <option value="Kayip">Kayıp</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.85rem' }}>Açıklama</label>
                                        <input type="text" className="form-input form-input-sm" value={formData.aciklama} placeholder="İsteğe bağlı..." onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} style={{ padding: '6px 12px' }} />
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                                    <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                                        <label className="form-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Zimmetlenecek Malzemeler</label>
                                        {!editingId && (
                                            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowProductModal(true)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>
                                                <Plus size={14} style={{ marginRight: '4px' }} /> Malzeme Ekle
                                            </button>
                                        )}
                                    </div>
                                    {selectedProducts.length > 0 ? (
                                        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                                                <thead><tr><th style={{ padding: '8px' }}>Malzeme Adı</th><th style={{ padding: '8px' }}>Seri No</th><th style={{ padding: '8px' }}>Barkod</th></tr></thead>
                                                <tbody>
                                                    {selectedProducts.map((p, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ padding: '8px' }}>{p.malzemeAdi}</td>
                                                            <td style={{ padding: '8px' }}>{p.seriNumarasi || '-'}</td>
                                                            <td style={{ padding: '8px' }}>{p.barkod || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)' }}>Henüz malzeme seçilmedi.</div>
                                    )}
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

            {showProductModal && (
                <div className="modal-overlay" style={{ zIndex: 1001 }}>
                    <div className="modal" style={{ maxWidth: '750px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h3>Fatura Kalemi Seçimi</h3>
                            <button className="modal-close" onClick={() => setShowProductModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                                <input type="text" className="form-input" placeholder="Malzeme adı, seri no veya barkod ara..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} autoFocus style={{ flex: 1 }} />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                    <input type="checkbox" checked={showAssigned} onChange={(e) => setShowAssigned(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                    Zimmetlileri göster
                                </label>
                            </div>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px', textAlign: 'center' }}></th>
                                        <th style={{ textAlign: 'left' }}>Malzeme Adı</th>
                                        <th style={{ width: '20%', textAlign: 'left' }}>Seri No</th>
                                        <th style={{ width: '20%', textAlign: 'left' }}>Barkod</th>
                                        {showAssigned && <th style={{ width: '100px', textAlign: 'center' }}>Durum</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(fk => (
                                        <tr key={fk.id} onClick={() => toggleProductSelection(fk.id)} style={{ cursor: 'pointer', opacity: fk.zimmetDurum ? 0.6 : 1, borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ textAlign: 'center' }}><input type="checkbox" checked={selectedProductIds.has(fk.id)} readOnly style={{ width: '16px', height: '16px' }} /></td>
                                            <td style={{ padding: '8px' }}>{fk.malzemeAdi}</td>
                                            <td style={{ padding: '8px' }}>{fk.seriNumarasi || '-'}</td>
                                            <td style={{ padding: '8px' }}>{fk.barkod || '-'}</td>
                                            {showAssigned && <td style={{ textAlign: 'center' }}><span className={`badge ${fk.zimmetDurum ? 'badge-error' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>{fk.zimmetDurum ? 'Zimmetli' : 'Boşta'}</span></td>}
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <tr><td colSpan={showAssigned ? 5 : 4} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                                            {productSearchTerm.trim() ? 'Kayıt bulunamadı.' : 'Arama yapmak için lütfen yazınız...'}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>İptal</button>
                            <button type="button" className="btn btn-primary" onClick={addSelectedProducts}>Seçilenleri Ekle</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message="Zimmet kaydını kaydetmek istediğinize emin misiniz?"
                confirmText="Kaydet"
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu zimmet kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
                variant="danger"
            />

            {/* Reassignment Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showReassignConfirm}
                title="Yeniden Zimmetleme Onayı"
                message="Seçilen malzemelerden bazıları zaten zimmetli. Devam ederseniz mevcut zimmetler kapatılacak ve yeniden zimmetleme yapılacak. Devam etmek istiyor musunuz?"
                confirmText="Devam Et"
                cancelText="İptal"
                onConfirm={() => { setShowReassignConfirm(false); setShowSaveConfirm(true); }}
                onCancel={() => setShowReassignConfirm(false)}
                variant="warning"
            />

            {/* Detail Modal */}
            {viewingZimmet && (
                <div className="modal-overlay" onClick={() => setViewingZimmet(null)} style={{ zIndex: 1100 }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Zimmet Detayı</h2>
                            <button className="modal-close" onClick={() => setViewingZimmet(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gap: '24px' }}>

                                {/* Ürün Bilgileri */}
                                <div className="info-section">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={18} /> Malzeme Bilgileri
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Malzeme Adı</label>
                                            <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>{viewingZimmet.malzemeAdi}</div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Durum</label>
                                            <div><span className={`badge ${getDurumBadge(viewingZimmet.durum)}`}>{viewingZimmet.durum}</span></div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seri Numarası</label>
                                            <div style={{ fontFamily: 'monospace' }}>{viewingZimmet.seriNumarasi || '-'}</div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Barkod</label>
                                            <div style={{ fontFamily: 'monospace' }}>{viewingZimmet.barkod || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Zimmet Sahibi */}
                                <div className="info-section">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ClipboardList size={18} /> Zimmet Sahibi
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tip</label>
                                            <div>{viewingZimmet.personelId ? 'Personel' : 'Bölüm / Oda'}</div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>İsim / Ad</label>
                                            <div style={{ fontWeight: 500 }}>{viewingZimmet.personelAdi || viewingZimmet.bolumAdi || '-'}</div>
                                        </div>
                                        {viewingZimmet.personelDepartman && (
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Departman</label>
                                                <div>{viewingZimmet.personelDepartman}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tarih ve Açıklama */}
                                <div className="info-section">
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={18} /> Detaylar
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zimmet Tarihi</label>
                                            <div>{new Date(viewingZimmet.zimmetTarihi).toLocaleDateString('tr-TR')}</div>
                                        </div>
                                        {viewingZimmet.iadeTarihi && (
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>İade Tarihi</label>
                                                <div>{new Date(viewingZimmet.iadeTarihi).toLocaleDateString('tr-TR')}</div>
                                            </div>
                                        )}
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Açıklama</label>
                                            <div style={{ whiteSpace: 'pre-wrap', color: viewingZimmet.aciklama ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                {viewingZimmet.aciklama || 'Açıklama yok.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setViewingZimmet(null)}>Kapat</button>
                            {canEdit && (
                                <button type="button" className="btn btn-primary" onClick={() => {
                                    handleEdit(viewingZimmet);
                                    setViewingZimmet(null);
                                }}>
                                    <Edit size={16} style={{ marginRight: '8px' }} /> Düzenle
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

