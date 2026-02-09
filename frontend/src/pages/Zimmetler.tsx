import { useEffect, useState, useMemo, Fragment, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, CheckCircle, RotateCcw, Edit, Trash2, X, AlertTriangle, Search, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { zimmetService, urunService, personelService, bolumService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zimmet } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Zimmetler() {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [zimmetler, setZimmetler] = useState<Zimmet[]>([]);
    const [urunler, setUrunler] = useState<any[]>([]);
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
    const [productCategoryFilter, setProductCategoryFilter] = useState('');
    const [productSerialFilter, setProductSerialFilter] = useState('');

    const [productBarcodeFilter, setProductBarcodeFilter] = useState('');

    // New: Show assigned products toggle
    const [showAssigned, setShowAssigned] = useState(false);

    // New: Reassignment Confirmation
    const [showReassignConfirm, setShowReassignConfirm] = useState(false);
    // Removed pendingProducts state

    // New: Expanded Product Details Index
    const [expandedProductIndex, setExpandedProductIndex] = useState<number | null>(null);

    // Filter data client-side with useMemo to prevent re-renders
    const filteredZimmetler = useMemo(() => {
        return zimmetler.filter(z => {
            const matchesSearch = z.urunAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (z.personelAdi?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (z.bolumAdi?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesDurum = !durumFilter || z.durum === durumFilter;
            return matchesSearch && matchesDurum;
        });
    }, [zimmetler, searchTerm, durumFilter]);

    // Stable data for DataTable - only update when modal is closed to prevent flickering
    const [stableTableData, setStableTableData] = useState<Zimmet[]>([]);
    useEffect(() => {
        if (!showModal && !showProductModal) {
            setStableTableData(filteredZimmetler);
        }
    }, [filteredZimmetler, showModal, showProductModal]);

    const [formData, setFormData] = useState({
        targetType: 'Personel' as 'Personel' | 'Bolum', // New: Target Type
        personelId: '',
        bolumId: '', // New: Bolum ID
        zimmetTarihi: new Date().toISOString().split('T')[0],
        aciklama: '',
        durum: 'Aktif'
    });

    const [selectedProducts, setSelectedProducts] = useState<any[]>([]); // New: Selected Products for batch add

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);


    const { hasEntityPermission } = useAuth();
    const canAdd = hasEntityPermission('zimmet', 'add');
    const canEdit = hasEntityPermission('zimmet', 'edit');
    const canDelete = hasEntityPermission('zimmet', 'delete');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            console.log('Loading zimmet data from API...');
            const [zimmetData, urunData, personelData, locationTree] = await Promise.all([
                zimmetService.getAll(),
                urunService.getAll(),
                personelService.getAll(),
                bolumService.getTree()
            ]);

            console.log('Data loaded:', { zimmetData, urunData, personelData, locationTree });

            setZimmetler(Array.isArray(zimmetData) ? zimmetData : []);
            setUrunler(Array.isArray(urunData) ? urunData : []);
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
            console.error('Veri yükleme hatası:', error);
        }
    };

    // Ref to track if fatura items have been processed
    const processedFaturaItems = useRef(false);

    // Handle incoming items from Fatura
    useEffect(() => {
        // Only process once per navigation
        if (location.state?.assignItems && urunler.length > 0 && !processedFaturaItems.current) {
            const items = location.state.assignItems;

            // Map fatura items to product objects
            const productsToAssign = items.map((item: any) => {
                const found = urunler.find(u => u.id === item.urunId);
                return found || { id: item.urunId, ad: item.urunAdi };
            });

            // Filter out any potential invalid items
            const validProducts = productsToAssign.filter((p: any) => p.id);

            if (validProducts.length > 0) {
                console.log('Faturadan gelen ürünler:', validProducts);
                const uniqueProducts = [];
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
                    targetType: 'Personel', // Default
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
    }, [location.state, urunler]);

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
        const urun = urunler.find(u => u.ad === zimmet.urunAdi); // Fallback if UrunId not directly available in Zimmet list object implies it usually is
        // Actually zimmet object has urunId.

        let targetType: 'Personel' | 'Bolum' = 'Personel';
        if (zimmet.bolumId) targetType = 'Bolum';

        setFormData({
            targetType,
            personelId: zimmet.personelId?.toString() || '',
            bolumId: zimmet.bolumId?.toString() || '',
            zimmetTarihi: zimmet.zimmetTarihi.split('T')[0],
            aciklama: zimmet.aciklama || '',
            durum: zimmet.durum
        });

        // For edit, we act as if only 1 product is selected
        if (urun) {
            setSelectedProducts([urun]);
        } else {
            // If we can't find the product object, we might have issues. 
            // But for Edit, we usually just update metadata, not change the product ID heavily or we might need product details.
            // Simplification: In Edit mode, we don't support changing the product list easily, or we treat it as single item edit.
            // The requirement was "Select multiple materials for a single zimmet assignment". 
            // Usually this implies "Create". "Edit" might remain single.
            // Let's keep Edit as single item edit for now to avoid complexity unless requested.
            // But we need to populate selectedProducts to show it in the table.
            const currentProduct = urunler.find(u => u.id === zimmet.urunId);
            if (currentProduct) setSelectedProducts([currentProduct]);
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
            loadData();
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
            alert('Lütfen en az bir ürün seçiniz.');
            return;
        }

        if (formData.targetType === 'Personel' && !formData.personelId) {
            alert('Lütfen personel seçiniz.');
            return;
        }

        if (formData.targetType === 'Bolum' && !formData.bolumId) {
            alert('Lütfen bölüm/oda seçiniz.');
            return;
        }

        // Check validation for reassignment
        const assignedProducts = selectedProducts.filter(p => p.durum === 'Aktif');
        if (assignedProducts.length > 0) {
            setShowReassignConfirm(true);
            return;
        }

        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            // Loop through selected products and create/update
            // Note: Update usually is for single item. If editingId is present, we only update that one.
            if (editingId) {
                // Update Single
                if (selectedProducts.length !== 1) {
                    alert("Düzenleme modunda sadece 1 ürün seçili olmalıdır.");
                    return;
                }
                const data = {
                    urunId: selectedProducts[0].id,
                    personelId: formData.targetType === 'Personel' ? parseInt(formData.personelId) : undefined,
                    bolumId: formData.targetType === 'Bolum' ? parseInt(formData.bolumId) : undefined,
                    zimmetTarihi: formData.zimmetTarihi,
                    aciklama: formData.aciklama,
                    durum: formData.durum
                };
                await zimmetService.update(editingId, data);
            } else {
                // Create Multiple
                for (const product of selectedProducts) {
                    const data = {
                        urunId: product.id,
                        personelId: formData.targetType === 'Personel' ? parseInt(formData.personelId) : undefined,
                        bolumId: formData.targetType === 'Bolum' ? parseInt(formData.bolumId) : undefined,
                        zimmetTarihi: formData.zimmetTarihi,
                        aciklama: formData.aciklama
                    };
                    await zimmetService.create(data);
                }
            }

            loadData();
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
            targetType: 'Personel',
            personelId: '',
            bolumId: '',
            zimmetTarihi: new Date().toISOString().split('T')[0],
            aciklama: '',
            durum: 'Aktif'
        });
        setSelectedProducts([]);
        setSelectedProductIds(new Set());
    };

    // --- Product Selection Logic ---
    const activeProducts = useMemo(() => {
        return urunler.filter(u => {
            // Edit mode: always show currently selected product
            if (editingId && selectedProducts.some(sp => sp.id === u.id)) return true;

            // If showAssigned is true, show everything (except maybe Hurda/Kayip/Satildi if those exist, but 'Aktif' means Assigned now)
            // User requested: "Zimmetli ürünler listelenmesin fakat bir checkbox olsun"
            // Our Schema: Pasif = Available, Aktif = Assigned.
            if (showAssigned) {
                return u.durum === 'Pasif' || u.durum === 'Aktif';
            }

            // Default: Show ONLY Pasif (Available)
            return u.durum === 'Pasif';
        });
    }, [urunler, editingId, selectedProducts, showAssigned]);

    const filteredProducts = useMemo(() => {

        return activeProducts.filter(u => {
            const matchesSearch = u.ad.toLowerCase().includes(productSearchTerm.toLowerCase());
            const matchesCategory = !productCategoryFilter || u.kategoriId.toString() === productCategoryFilter;
            const matchesSerial = !productSerialFilter || (u.seriNumarasi || '').toLowerCase().includes(productSerialFilter.toLowerCase());
            const matchesBarcode = !productBarcodeFilter || (u.barkod || '').toLowerCase().includes(productBarcodeFilter.toLowerCase());
            return matchesSearch && matchesCategory && matchesSerial && matchesBarcode;
        });
    }, [activeProducts, productSearchTerm, productCategoryFilter, productSerialFilter, productBarcodeFilter]);

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
        const productsToAdd = urunler.filter(u => selectedProductIds.has(u.id));
        finalizeAddProducts(productsToAdd);
    };

    const finalizeAddProducts = (products: any[]) => {
        // Merge with existing selected products, avoiding duplicates
        const newSelection = [...selectedProducts];
        products.forEach(p => {
            if (!newSelection.find(existing => existing.id === p.id)) {
                newSelection.push(p);
            }
        });
        setSelectedProducts(newSelection);
        setShowProductModal(false);
        setProductSearchTerm('');
        setProductCategoryFilter('');
        setProductSerialFilter('');
        setProductBarcodeFilter('');
        setSelectedProductIds(new Set());
        setShowReassignConfirm(false);
    };

    const removeSelectedProduct = (id: number) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    };

    // Memoize columns to prevent DataTable re-renders
    const columns: Column<Zimmet>[] = useMemo(() => [
        {
            header: 'Ürün',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {zimmet.urunAdi}
                </span>
            )
        },
        {
            header: 'Zimmet Yeri',
            render: (zimmet: Zimmet) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {zimmet.personelAdi ? (
                        <>
                            <span title="Personel">👤</span>
                            <span>{zimmet.personelAdi}</span>
                        </>
                    ) : (
                        <>
                            <span title="Bölüm/Oda">📍</span>
                            <span>{zimmet.bolumAdi || '-'}</span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Zimmet Tarihi',
            render: (zimmet: Zimmet) => new Date(zimmet.zimmetTarihi).toLocaleDateString('tr-TR')
        },
        {
            header: 'İade Tarihi',
            render: (zimmet: Zimmet) => zimmet.iadeTarihi
                ? new Date(zimmet.iadeTarihi).toLocaleDateString('tr-TR')
                : '-'
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
            header: 'Açıklama',
            render: (zimmet: Zimmet) => (
                <span style={{ color: 'var(--text-muted)', maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {zimmet.aciklama || '-'}
                </span>
            )
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

    return (
        <>
            <div className="page-content">
                {/* Header Title */}
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)', color: 'var(--text-primary)' }}>
                    Zimmetler
                </h1>

                {/* Stats & Controls Container */}
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>

                    {/* Stats Grid */}
                    <div className="dashboard-grid" style={{
                        flex: 1,
                        marginBottom: 0,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)', // Force 4 equal columns filling all space
                        gap: 'var(--spacing-md)'
                    }}>
                        <div className="stat-card">
                            <div className="stat-card-icon">
                                <ClipboardList size={24} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{zimmetler.length}</div>
                                <div className="stat-card-label">Toplam Zimmet</div>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-card-icon success">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">{zimmetler.filter(z => z.durum === 'Aktif').length}</div>
                                <div className="stat-card-label">Aktif Zimmet</div>
                            </div>
                        </div>
                        <div className="stat-card info">
                            <div className="stat-card-icon info">
                                <RotateCcw size={24} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">
                                    {zimmetler.filter(z => z.durum === 'Iade').length}
                                </div>
                                <div className="stat-card-label">İade Edilmiş</div>
                            </div>
                        </div>
                        <div className="stat-card error">
                            <div className="stat-card-icon error">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="stat-card-content">
                                <div className="stat-card-value">
                                    {zimmetler.filter(z => z.durum === 'Kayip').length}
                                </div>
                                <div className="stat-card-label">Kayıp</div>
                            </div>
                        </div>
                    </div>

                    {/* Controls Stack */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', width: '300px', flexShrink: 0 }}>
                        {/* Search Bar */}
                        <div className="search-box" style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Ürün, Personel veya Bölüm ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '36px', width: '100%' }}
                            />
                        </div>

                        {/* Add Button */}
                        {canAdd && (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({
                                        targetType: 'Personel',
                                        personelId: '',
                                        bolumId: '',
                                        zimmetTarihi: new Date().toISOString().split('T')[0],
                                        aciklama: '',
                                        durum: 'Aktif'
                                    });
                                    setSelectedProducts([]);
                                    setShowModal(true);
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', width: '100%' }}
                            >
                                <Plus size={18} /> Zimmet Ekle
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={stableTableData}
                    emptyMessage="Zimmet kaydı bulunamadı."
                />
            </div>

            {/* Main Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Zimmet Düzenle' : 'Zimmet Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">

                                {/* Target Selection */}
                                {/* Target Selection - Compact */}
                                <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '16px', alignItems: 'center' }}>
                                        {/* Radio Group */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hedef</label>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input
                                                        type="radio"
                                                        name="targetType"
                                                        checked={formData.targetType === 'Personel'}
                                                        onChange={() => setFormData({ ...formData, targetType: 'Personel', bolumId: '' })}
                                                    />
                                                    <span>👤 Personel</span>
                                                </label>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input
                                                        type="radio"
                                                        name="targetType"
                                                        checked={formData.targetType === 'Bolum'}
                                                        onChange={() => setFormData({ ...formData, targetType: 'Bolum', personelId: '' })}
                                                    />
                                                    <span>📍 Bölüm</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Dropdown */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                {formData.targetType === 'Personel' ? 'Personel Seçiniz' : 'Bölüm Seçiniz'}
                                            </label>
                                            {formData.targetType === 'Personel' ? (
                                                <select className="form-select form-select-sm" required value={formData.personelId}
                                                    onChange={(e) => setFormData({ ...formData, personelId: e.target.value })}
                                                    style={{ padding: '6px 12px' }}>
                                                    <option value="">Seçiniz...</option>
                                                    {personeller.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.tamAd}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <select className="form-select form-select-sm" required value={formData.bolumId}
                                                    onChange={(e) => setFormData({ ...formData, bolumId: e.target.value })}
                                                    style={{ padding: '6px 12px' }}>
                                                    <option value="">Seçiniz...</option>
                                                    {flatLocations.map((loc) => (
                                                        <option key={loc.id} value={loc.id}>
                                                            {Array(loc.level).fill('\u00A0\u00A0').join('')}
                                                            {loc.type === 'Bina' ? '🏢 ' : loc.type === 'Kat' ? '≡ ' : loc.type === 'Oda' ? '🚪 ' : '📍 '}
                                                            {loc.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.85rem' }}>Zimmet Tarihi</label>
                                        <input type="date" className="form-input form-input-sm" required value={formData.zimmetTarihi}
                                            onChange={(e) => setFormData({ ...formData, zimmetTarihi: e.target.value })}
                                            style={{ padding: '6px 12px' }} />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.85rem' }}>Durum</label>
                                        <select className="form-select form-select-sm" value={formData.durum}
                                            onChange={(e) => setFormData({ ...formData, durum: e.target.value })}
                                            style={{ padding: '6px 12px' }}>
                                            <option value="Aktif">Aktif</option>
                                            <option value="Iade">İade</option>
                                            <option value="Kayip">Kayıp</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.85rem' }}>Açıklama</label>
                                        <input type="text" className="form-input form-input-sm" value={formData.aciklama}
                                            placeholder="İsteğe bağlı..."
                                            onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                                            style={{ padding: '6px 12px' }} />
                                    </div>
                                </div>

                                {/* Product Selection Section */}
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
                                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
                                                    <tr>
                                                        <th style={{ padding: '8px' }}>Malzeme Adı</th>
                                                        <th style={{ padding: '8px' }}>Barkod / Seri No</th>
                                                        {!editingId && <th style={{ width: '40px', padding: '8px' }}></th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedProducts.map((p, idx) => {
                                                        const isExpanded = expandedProductIndex === idx;
                                                        return (
                                                            <Fragment key={idx}>
                                                                <tr
                                                                    onClick={() => setExpandedProductIndex(isExpanded ? null : idx)}
                                                                    style={{ cursor: 'pointer', background: isExpanded ? 'var(--bg-secondary)' : 'transparent' }}
                                                                >
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '10px' }}>
                                                                            <span style={{ fontWeight: 500 }}>{p.ad}</span>
                                                                            <span style={{ color: 'var(--text-muted)' }}>
                                                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ color: 'var(--text-muted)' }}>
                                                                        {p.barkod || p.seriNumarasi || '-'}
                                                                    </td>
                                                                    {!editingId && (
                                                                        <td>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-icon btn-danger btn-sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    removeSelectedProduct(p.id);
                                                                                }}
                                                                            >
                                                                                <X size={14} />
                                                                            </button>
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr>
                                                                        <td colSpan={editingId ? 2 : 3} style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)' }}>
                                                                            <div className="grid-3" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                                                <div><strong style={{ color: 'var(--text-primary)' }}>Marka:</strong> {p.marka || '-'}</div>
                                                                                <div><strong style={{ color: 'var(--text-primary)' }}>Model:</strong> {p.model || '-'}</div>
                                                                                <div><strong style={{ color: 'var(--text-primary)' }}>Seri Numarası:</strong> {p.seriNumarasi || '-'}</div>
                                                                                <div><strong style={{ color: 'var(--text-primary)' }}>Barkod Numarası:</strong> {p.barkod || '-'}</div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                                            Henüz malzeme seçilmedi.
                                        </div>
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

            {/* Product Selection Modal */}
            {showProductModal && (
                <div className="modal-overlay" style={{ zIndex: 1001 }}>
                    <div className="modal" style={{ maxWidth: '700px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h3>Malzeme Seçimi</h3>
                            <button className="modal-close" onClick={() => setShowProductModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            {/* Search & Filter */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ürün adı ara..."
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                    style={{ flex: 2, minWidth: '150px' }}
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Seri No / Barkod..."
                                    value={productSerialFilter}
                                    onChange={(e) => setProductSerialFilter(e.target.value)}

                                    style={{ flex: 1, minWidth: '120px' }}
                                />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem', userSelect: 'none' }}>
                                    <input
                                        type="checkbox"
                                        checked={showAssigned}
                                        onChange={(e) => setShowAssigned(e.target.checked)}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    <span>Zimmetli Ürünleri Göster</span>
                                </label>
                            </div>

                            {/* Product List */}
                            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <table className="data-table" style={{ width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ width: '40px' }}></th>
                                            <th>Malzeme Adı</th>
                                            <th>Barkod</th>
                                            <th>Seri No</th>
                                            <th>Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((urun) => (
                                            <tr
                                                key={urun.id}
                                                onClick={() => toggleProductSelection(urun.id)}
                                                style={{ cursor: 'pointer', background: selectedProductIds.has(urun.id) ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProductIds.has(urun.id)}
                                                        onChange={() => toggleProductSelection(urun.id)}
                                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                    />
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{urun.ad}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{urun.barkod || '-'}</td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{urun.seriNumarasi || '-'}</td>
                                                <td>{urun.stokMiktari} {urun.birim}</td>
                                            </tr>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                    {(!productSearchTerm && !productSerialFilter && !productBarcodeFilter)
                                                        ? 'Listelenecek uygun malzeme bulunamadı.'
                                                        : 'Aradığınız kriterlere uygun malzeme bulunamadı.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Selection Info */}
                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    <strong>{selectedProductIds.size}</strong> ürün seçildi
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>İptal</button>
                            <button type="button" className="btn btn-primary" onClick={addSelectedProducts} disabled={selectedProductIds.size === 0}>
                                Seçilenleri Ekle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message={editingId ? 'Bu zimmet kaydını güncellemek istediğinize emin misiniz?' : 'Seçili ürünleri zimmetlemek istediğinize emin misiniz?'}
                confirmText={editingId ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu zimmet kaydını silmek istediğinize emin misiniz?"
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
            />
            {/* Reassignment Confirmation */}
            <ConfirmDialog
                isOpen={showReassignConfirm}
                title="Zimmet Değişikliği"
                message="Seçilen ürünlerden bazıları şu anda başka birine zimmetli (Aktif). Devam ederseniz bu ürünlerin zimmeti yeni kişiye/bölüme aktarılacaktır. Onaylıyor musunuz?"
                confirmText="Evet, Aktar"
                cancelText="İptal"
                onConfirm={() => {
                    setShowReassignConfirm(false);
                    confirmSave();
                }}
                onCancel={() => {
                    setShowReassignConfirm(false);
                }}
                variant="warning"
            />
        </>
    );
}
