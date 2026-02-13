import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Download, Filter, Search, X, Package, ChevronDown, ChevronUp, Edit, Upload, FileText, Split, Info } from 'lucide-react';
import { faturaService, cariService, malzemeKalemiService, kategoriService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Fatura, Cari, MalzemeKalemi, FaturaKalemiCreate, Kategori } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import CariModal from '../components/shared/CariModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Faturalar() {
    const { hasEntityPermission } = useAuth();
    const [faturalar, setFaturalar] = useState<Fatura[]>([]);
    const [cariler, setCariler] = useState<Cari[]>([]);
    const [malzemeler, setMalzemeler] = useState<MalzemeKalemi[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [filterCari, setFilterCari] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    const [formData, setFormData] = useState({ faturaNo: '', cariId: '', faturaTarihi: '', aciklama: '' });
    const [kalemler, setKalemler] = useState<FaturaKalemiCreate[]>([]);
    const [showCariModal, setShowCariModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
    const [bulkModeIndexes, setBulkModeIndexes] = useState<Set<number>>(new Set());
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
    const [kategoriler, setKategoriler] = useState<Kategori[]>([]);

    // Yeni malzeme modal state
    const [showNewMaterialModal, setShowNewMaterialModal] = useState(false);
    const [newMaterialFormData, setNewMaterialFormData] = useState({
        ad: '',
        dmbNo: '',
        rutin: '',
        aciklama: '',
        birim: 'Adet' // Default unit
    });

    const [editingId, setEditingId] = useState<number | null>(null);

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetailFatura, setSelectedDetailFatura] = useState<Fatura | null>(null);

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Zimmet confirmation state
    const [showZimmetConfirm, setShowZimmetConfirm] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showNewMaterialConfirm, setShowNewMaterialConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [debugError, setDebugError] = useState<string | null>(null);
    const navigate = useNavigate();

    const canAdd = hasEntityPermission('fatura', 'add');
    const canEdit = hasEntityPermission('fatura', 'edit');
    const canDelete = hasEntityPermission('fatura', 'delete');

    // Initial load for dropdowns
    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                const [carilerData, malzemelerData] = await Promise.all([
                    cariService.getAll(),
                    malzemeKalemiService.getAll()
                ]);
                setCariler(carilerData);
                setMalzemeler(malzemelerData);
            } catch (error) {
                console.error('Dropdown verileri yüklenirken hata:', error);
            }
        };
        loadDropdowns();
    }, []);

    // Pagination load

    const loadData = async (currentPage: number, currentPageSize: number, search: string) => {
        setIsLoading(true);
        try {
            const result = await faturaService.getPaged(currentPage, currentPageSize, search);
            setFaturalar(result.items);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            setDebugError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    // Data fetching effect
    useEffect(() => {
        loadData(page, pageSize, searchTerm);
    }, [page, pageSize]); // searchTerm is excluded to avoid double fetch with handleSearch, but we need to fetch on mount

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
        loadData(1, pageSize, term);
    };

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    // Filtered products for modal
    const filteredProducts = useMemo(() => {
        if (!productSearchTerm) return [];
        return malzemeler.filter(u => {
            const matchesSearch = u.ad.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                (u.dmbNo && u.dmbNo.toLowerCase().includes(productSearchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [malzemeler, productSearchTerm]);

    const calculateKalemToplam = (kalem: FaturaKalemiCreate) => {
        const araToplam = kalem.miktar * kalem.birimFiyat;
        const indirimTutari = araToplam * (kalem.indirimOrani / 100);
        const kdvTutari = (araToplam - indirimTutari) * (kalem.kdvOrani / 100);
        return araToplam - indirimTutari + kdvTutari;
    };

    const genelToplam = useMemo(() => {
        return kalemler.reduce((total, kalem) => total + calculateKalemToplam(kalem), 0);
    }, [kalemler]);

    const toggleProductSelection = (productId: number) => {
        const newSet = new Set(selectedProductIds);
        if (newSet.has(productId)) {
            newSet.delete(productId);
        } else {
            newSet.add(productId);
        }
        setSelectedProductIds(newSet);
    };

    const addSelectedProducts = () => {
        const newKalemler = Array.from(selectedProductIds).map(productId => {
            const urun = malzemeler.find(u => u.id === productId);
            return {
                malzemeKalemiId: productId,
                malzemeAdi: urun?.ad || '',
                miktar: 1,
                birimFiyat: 0, // Maliyet is removed from base entity or needs to be fetched? Default 0.
                indirimOrani: 0,
                kdvOrani: 20,
                seriNumarasi: '',
                barkod: '',
                zimmetDurum: false
            };
        });
        setKalemler([...kalemler, ...newKalemler]);
        setSelectedProductIds(new Set());
        setProductSearchTerm('');
        setShowProductModal(false);
    };

    const handleNewMaterialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowNewMaterialConfirm(true);
    };

    const confirmNewMaterialSubmit = async () => {
        try {
            const createData = {
                ad: newMaterialFormData.ad,
                dmbNo: newMaterialFormData.dmbNo,
                rutin: newMaterialFormData.rutin,
                aciklama: newMaterialFormData.aciklama,
                birim: newMaterialFormData.birim,
                ekParcaVar: false,
                state: 0 // Pasif / Clean state
            };

            const createdMalzeme = await malzemeKalemiService.create(createData);

            // Update list
            setMalzemeler([...malzemeler, createdMalzeme]);

            // Add to invoice items
            const newKalem: FaturaKalemiCreate = {
                malzemeKalemiId: createdMalzeme.id,
                malzemeAdi: createdMalzeme.ad,
                miktar: 1,
                birimFiyat: 0,
                indirimOrani: 0,
                kdvOrani: 20,
                seriNumarasi: '',
                barkod: '',
                zimmetDurum: false
            };
            setKalemler([...kalemler, newKalem]);

            setShowNewMaterialModal(false);
            setNewMaterialFormData({ ad: '', dmbNo: '', rutin: '', aciklama: '', birim: 'Adet' });
            setShowNewMaterialConfirm(false);
        } catch (error) {
            console.error('Malzeme kaydedilirken hata oluştu:', error);
            alert('Malzeme kaydedilirken bir hata oluştu.');
        }
    };

    const removeKalem = (index: number) => {
        setKalemler(kalemler.filter((_, i) => i !== index));
    };

    const updateKalem = (index: number, field: string, value: any) => {
        const updated = [...kalemler];
        (updated[index] as any)[field] = value;
        setKalemler(updated);
    };

    const splitKalem = (index: number) => {
        const kalem = kalemler[index];
        if (kalem.miktar <= 1) return;

        const newKalemler = [...kalemler];
        newKalemler.splice(index, 1);

        for (let i = 0; i < kalem.miktar; i++) {
            newKalemler.splice(index + i, 0, {
                ...kalem,
                miktar: 1,
                seriNumarasi: i === 0 ? kalem.seriNumarasi : '',
                barkod: i === 0 ? kalem.barkod : ''
            });
        }

        const newBulkIndexes = new Set(bulkModeIndexes);
        newBulkIndexes.delete(index);
        setBulkModeIndexes(newBulkIndexes);

        setKalemler(newKalemler);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (kalemler.length > 0) {
            for (let i = 0; i < kalemler.length; i++) {
                const kalem = kalemler[i];
                if (kalem.kdvOrani === undefined || kalem.kdvOrani === null || isNaN(kalem.kdvOrani)) {
                    alert(`${i + 1}. kalem için KDV oranı girilmedi.`);
                    return;
                }
            }
        }
        setShowSaveConfirm(true);
    };

    const confirmSave = () => {
        setShowSaveConfirm(false);
        if (!editingId) {
            setShowZimmetConfirm(true);
        } else {
            finalizeSave(false);
        }
    };

    const handleRowClick = (fatura: Fatura) => {
        setSelectedDetailFatura(fatura);
        setShowDetailModal(true);
    };

    const finalizeSave = async (shouldAssign: boolean) => {
        try {
            const data = {
                faturaNo: formData.faturaNo,
                cariId: parseInt(formData.cariId),
                faturaTarihi: formData.faturaTarihi,
                aciklama: formData.aciklama || undefined,
                kalemler: kalemler.map((k) => ({
                    malzemeKalemiId: k.malzemeKalemiId,
                    malzemeAdi: k.malzemeAdi,
                    miktar: k.miktar,
                    birimFiyat: k.birimFiyat,
                    indirimOrani: k.indirimOrani,
                    kdvOrani: k.kdvOrani,
                    zimmetDurum: k.zimmetDurum,
                    seriNumarasi: k.seriNumarasi || null,
                    barkod: k.barkod || null
                })),
            };

            if (editingId) {
                await faturaService.update(editingId, data);
            } else {
                await faturaService.create(data);
            }

            loadData(page, pageSize, searchTerm);
            closeModal();

            if (shouldAssign) {
                navigate('/zimmetler', { state: { assignItems: kalemler } });
            }
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    const handleEdit = (fatura: Fatura) => {
        setEditingId(fatura.id);
        setFormData({
            faturaNo: fatura.faturaNo,
            cariId: fatura.cariId.toString(),
            faturaTarihi: fatura.faturaTarihi.split('T')[0],
            aciklama: fatura.aciklama || ''
        });

        if (fatura.kalemler && fatura.kalemler.length > 0) {
            setKalemler(fatura.kalemler.map(k => ({
                malzemeKalemiId: k.malzemeKalemiId,
                malzemeAdi: k.malzemeAdi,
                miktar: k.miktar,
                birimFiyat: k.birimFiyat,
                indirimOrani: k.indirimOrani,
                kdvOrani: k.kdvOrani,
                seriNumarasi: k.seriNumarasi || '',
                barkod: k.barkod || '',
                zimmetDurum: k.zimmetDurum || false
            })));
        } else {
            setKalemler([]);
        }

        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await faturaService.delete(deleteId);
            await faturaService.delete(deleteId);
            loadData(page, pageSize, searchTerm);
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ faturaNo: '', cariId: '', faturaTarihi: '', aciklama: '' });
        setKalemler([]);
        setProductSearchTerm('');
        setSelectedProductIds(new Set());
    };

    const clearFilters = () => {
        setFilterCari('');
        setFilterStartDate('');
        setFilterEndDate('');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploading(true);
            try {
                const data = await faturaService.uploadPdf(file);
                // Note: uploadPdf logic needs to be updated on backend to return MalzemeKalemiIds if possible,
                // or just names. Assuming backend change is done.
                setFormData({
                    faturaNo: data.faturaNo,
                    cariId: data.cariId.toString(),
                    faturaTarihi: data.faturaTarihi.split('T')[0],
                    aciklama: data.aciklama || ''
                });

                if (data.kalemler && data.kalemler.length > 0) {
                    setKalemler(data.kalemler.map((k: any) => {
                        const urun = malzemeler.find(u => u.id === k.malzemeKalemiId);
                        return {
                            malzemeKalemiId: k.malzemeKalemiId,
                            malzemeAdi: urun ? urun.ad : k.malzemeAdi || '',
                            miktar: k.miktar,
                            birimFiyat: k.birimFiyat,
                            indirimOrani: k.indirimOrani,
                            kdvOrani: k.kdvOrani,
                            seriNumarasi: k.seriNumarasi || '',
                            barkod: k.barkod || '',
                            zimmetDurum: false
                        };
                    }));
                }

                setEditingId(null);
                setShowModal(true);
            } catch (error) {
                console.error('PDF yükleme hatası:', error);
                alert('PDF yükleme sırasında bir hata oluştu veya dosya formatı geçersiz.');
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const columns: Column<Fatura>[] = [
        {
            header: 'Fatura No',
            render: (fatura) => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{fatura.faturaNo}</span>
            )
        },
        { header: 'Cari', accessor: 'cariAdi' },
        {
            header: 'Tarih',
            render: (fatura) => new Date(fatura.faturaTarihi).toLocaleDateString('tr-TR')
        },
        {
            header: 'Toplam Adet',
            render: (fatura) => {
                const toplamAdet = fatura.kalemler?.reduce((sum, kalem) => sum + (kalem.miktar || 1), 0) || 0;
                return <span style={{ fontWeight: 500 }}>{toplamAdet}</span>;
            }
        },
        {
            header: 'Genel Toplam',
            render: (fatura) => <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{formatCurrency(fatura.genelToplam)}</span>
        },
        ...((canEdit || canDelete) ? [{
            header: 'İşlemler',
            render: (fatura: Fatura) => (
                <div className="flex gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(fatura)}>
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(fatura.id)}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }] : [])
    ];

    return (
        <>
            <div className="page-content">
                {debugError && (
                    <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', marginBottom: '10px', borderRadius: '4px' }}>
                        <strong>Hata:</strong> {debugError}
                    </div>
                )}

                <DataTable
                    title="Faturalar"
                    columns={columns}
                    data={faturalar}
                    searchable={true}
                    onSearch={handleSearch}
                    searchPlaceholder="Fatura no veya cari ara..."
                    onAdd={canAdd ? () => {
                        setEditingId(null);
                        setFormData({ faturaNo: '', cariId: '', faturaTarihi: new Date().toISOString().split('T')[0], aciklama: '' });
                        setKalemler([]);
                        setShowModal(true);
                    } : undefined}
                    addButtonLabel="Fatura Ekle"
                    emptyMessage="Hiç fatura bulunamadı."
                    extraToolbarContent={
                        <div className="flex gap-sm items-center">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf" style={{ display: 'none' }} />
                            {canAdd && (
                                <button className="btn btn-secondary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                                    <Upload size={18} /> {uploading ? 'Yükleniyor...' : 'PDF Fatura Ekle'}
                                </button>
                            )}
                            {/* Filter removed temporarily for server-side pagination */}
                        </div>
                    }
                    onRowClick={handleRowClick}
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
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h2>{editingId ? 'Fatura Düzenle' : 'Fatura Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid-3">
                                    <div className="form-group">
                                        <label className="form-label">Cari</label>
                                        <select className="form-select" required value={formData.cariId}
                                            onChange={(e) => setFormData({ ...formData, cariId: e.target.value })}>
                                            <option value="">Cari Seçiniz</option>
                                            {cariler.map((c) => (<option key={c.id} value={c.id}>{c.firmaAdi}</option>))}
                                        </select>
                                        <button type="button" className="btn btn-primary btn-sm mt-2" style={{ marginTop: '8px', width: '100%' }} onClick={() => setShowCariModal(true)}>
                                            <Plus size={16} style={{ marginRight: '6px' }} /> Cari Ekle
                                        </button>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fatura No</label>
                                        <input type="text" className="form-input" required value={formData.faturaNo}
                                            onChange={(e) => setFormData({ ...formData, faturaNo: e.target.value })} placeholder="Fatura No" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fatura Tarihi</label>
                                        <input type="date" className="form-input" required value={formData.faturaTarihi}
                                            onChange={(e) => setFormData({ ...formData, faturaTarihi: e.target.value })} />
                                    </div>
                                </div>

                                {/* Malzeme Ekleme Bölümü */}
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <label className="form-label" style={{ margin: 0 }}>Fatura Kalemleri</label>
                                        <div className="flex gap-sm">
                                            <button type="button" className="btn btn-outline" onClick={() => {
                                                setNewMaterialFormData({ ad: '', dmbNo: '', rutin: '', aciklama: '', birim: 'Adet' });
                                                setShowNewMaterialModal(true);
                                            }}>
                                                <Plus size={16} style={{ marginRight: '6px' }} /> Yeni Malzeme Kaydet
                                            </button>
                                            <button type="button" className="btn btn-primary" onClick={() => setShowProductModal(true)}>
                                                <Package size={16} style={{ marginRight: '6px' }} /> Malzeme Ekle
                                            </button>
                                        </div>
                                    </div>

                                    {kalemler.length > 0 ? (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="data-table" style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '20%' }}>Malzeme Adı</th>
                                                        <th style={{ width: '12%' }}>Miktar</th>
                                                        <th style={{ width: '12%' }}>Seri No</th>
                                                        <th style={{ width: '12%' }}>Barkod</th>
                                                        <th style={{ width: '12%' }}>Birim Fiyat</th>
                                                        <th style={{ width: '8%' }}>KDV %</th>
                                                        <th style={{ width: '8%' }}>İndirim %</th>
                                                        <th style={{ width: '12%' }}>Toplam</th>
                                                        <th style={{ width: '4%' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {kalemler.map((kalem, index) => {
                                                        const urun = malzemeler.find(u => u.id === kalem.malzemeKalemiId);
                                                        const isExpanded = expandedRowIndex === index;

                                                        return (
                                                            <React.Fragment key={index}>
                                                                <tr>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <div style={{ position: 'relative', flex: 1 }}>
                                                                                <input type="text" className="form-input" value={kalem.malzemeAdi}
                                                                                    readOnly
                                                                                    onClick={() => setExpandedRowIndex(isExpanded ? null : index)}
                                                                                    placeholder="Malzeme seçiniz"
                                                                                    style={{ width: '100%', cursor: 'pointer', paddingRight: '30px' }} />
                                                                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                                                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                                </span>
                                                                            </div>
                                                                            {kalem.miktar > 1 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-icon btn-secondary"
                                                                                    onClick={() => splitKalem(index)}
                                                                                    title="Seri numarası girmek için satırlara ayır"
                                                                                    style={{ color: 'var(--primary-400)' }}
                                                                                >
                                                                                    <Split size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={bulkModeIndexes.has(index)}
                                                                                onChange={(e) => {
                                                                                    const newSet = new Set(bulkModeIndexes);
                                                                                    if (e.target.checked) {
                                                                                        newSet.add(index);
                                                                                    } else {
                                                                                        newSet.delete(index);
                                                                                        updateKalem(index, 'miktar', 1);
                                                                                    }
                                                                                    setBulkModeIndexes(newSet);
                                                                                }}
                                                                                title="Toplu miktar girişi"
                                                                                style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                                                                            />
                                                                            {bulkModeIndexes.has(index) ? (
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-input"
                                                                                    min="1"
                                                                                    value={kalem.miktar === 0 ? '' : kalem.miktar}
                                                                                    onChange={(e) => {
                                                                                        const val = e.target.value;
                                                                                        updateKalem(index, 'miktar', val === '' ? 0 : parseInt(val) || 0);
                                                                                    }}
                                                                                    placeholder="Adet"
                                                                                    style={{ width: '80px' }}
                                                                                />
                                                                            ) : (
                                                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>1 adet</span>
                                                                            )}
                                                                        </div>
                                                                    </td>

                                                                    <td>
                                                                        <input type="text" className="form-input" value={kalem.seriNumarasi || ''}
                                                                            onChange={(e) => updateKalem(index, 'seriNumarasi', e.target.value)}
                                                                            placeholder="Seri No"
                                                                            style={{ width: '100%' }} />
                                                                    </td>
                                                                    <td>
                                                                        <input type="text" className="form-input" value={kalem.barkod || ''}
                                                                            onChange={(e) => updateKalem(index, 'barkod', e.target.value)}
                                                                            placeholder="Barkod"
                                                                            style={{ width: '100%' }} />
                                                                    </td>

                                                                    <td>
                                                                        <input type="number" className="form-input" min="0" step="0.01" value={kalem.birimFiyat || ''}
                                                                            onChange={(e) => updateKalem(index, 'birimFiyat', parseFloat(e.target.value) || 0)}
                                                                            style={{ width: '100%' }} />
                                                                    </td>
                                                                    <td>
                                                                        <input type="number" className="form-input" min="0" max="100"
                                                                            value={kalem.kdvOrani === 0 ? '' : (kalem.kdvOrani ?? '')}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                updateKalem(index, 'kdvOrani', val === '' ? undefined : parseFloat(val));
                                                                            }}
                                                                            style={{ width: '100%' }} />
                                                                    </td>
                                                                    <td>
                                                                        <input type="number" className="form-input" min="0" max="100" value={kalem.indirimOrani || ''}
                                                                            onChange={(e) => updateKalem(index, 'indirimOrani', parseFloat(e.target.value) || 0)}
                                                                            style={{ width: '100%' }} />
                                                                    </td>
                                                                    <td style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                                                                        {formatCurrency(calculateKalemToplam(kalem))}
                                                                    </td>
                                                                    <td>
                                                                        <button type="button" className="btn btn-icon btn-danger" onClick={() => removeKalem(index)}>
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && urun && (
                                                                    <tr>
                                                                        <td colSpan={9} style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)' }}>
                                                                            <div className="grid-2" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                                                <div><strong style={{ color: 'var(--text-primary)' }}>DMB No:</strong> {urun.dmbNo || '-'}</div>
                                                                                <div><strong style={{ color: 'var(--text-primary)' }}>Rutin:</strong> {urun.rutin || '-'}</div>
                                                                                <div><strong style={{ color: 'var(--text-primary)' }}>Açıklama:</strong> {urun.aciklama || '-'}</div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--spacing-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ color: 'var(--text-muted)', marginRight: 'var(--spacing-md)' }}>Genel Toplam:</span>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                                                        {formatCurrency(genelToplam)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                                            <Package size={32} style={{ marginBottom: 'var(--spacing-sm)', opacity: 0.5 }} />
                                            <p>Henüz malzeme eklenmedi. "Malzeme Ekle" butonunu kullanarak malzeme ekleyebilirsiniz.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={2} value={formData.aciklama}
                                        placeholder="Açıklama"
                                        onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
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

            {/* New Material Modal */}
            {showNewMaterialModal && (
                <div className="modal-overlay" style={{ zIndex: 1002 }}>
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Yeni Malzeme Kaydet</h2>
                            <button className="modal-close" onClick={() => setShowNewMaterialModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleNewMaterialSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Malzeme Adı</label>
                                    <input type="text" className="form-input" required value={newMaterialFormData.ad} onChange={e => setNewMaterialFormData({ ...newMaterialFormData, ad: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">DMB No</label>
                                    <input type="text" className="form-input" value={newMaterialFormData.dmbNo} onChange={e => setNewMaterialFormData({ ...newMaterialFormData, dmbNo: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Rutin</label>
                                    <input type="text" className="form-input" value={newMaterialFormData.rutin} onChange={e => setNewMaterialFormData({ ...newMaterialFormData, rutin: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewMaterialModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {showFilter && (
                <div className="modal-overlay" onClick={() => setShowFilter(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>Filtrele</h2>
                            <button className="modal-close" onClick={() => setShowFilter(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Cari Seçimi</label>
                                <select className="form-select" value={filterCari} onChange={(e) => setFilterCari(e.target.value)}>
                                    <option value="">Tüm Cariler</option>
                                    {cariler.map((c) => (<option key={c.id} value={c.id}>{c.firmaAdi}</option>))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Başlangıç Tarihi</label>
                                <input type="date" className="form-input" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bitiş Tarihi</label>
                                <input type="date" className="form-input" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={clearFilters}>Temizle</button>
                            <button className="btn btn-primary" onClick={() => setShowFilter(false)}>Uygula</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Selection Modal */}
            {showProductModal && (
                <div className="modal-overlay" style={{ zIndex: 1001 }}>
                    <div className="modal" style={{ maxWidth: '800px', width: '90%', maxHeight: '65vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h3>Malzeme Seçimi</h3>
                            <button className="modal-close" onClick={() => setShowProductModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <input type="text" className="form-input" placeholder="Malzeme ara..." value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} autoFocus />
                            </div>
                            <table className="data-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th>Malzeme</th>
                                        <th style={{ width: '150px' }}>DMB No</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} onClick={() => toggleProductSelection(p.id)} style={{ cursor: 'pointer' }}>
                                            <td><input type="checkbox" checked={selectedProductIds.has(p.id)} readOnly style={{ cursor: 'pointer' }} /></td>
                                            <td><div style={{ padding: '4px 0' }}>{p.ad}</div></td>
                                            <td>{p.dmbNo || '-'}</td>
                                        </tr>
                                    ))}
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

            {/* Confirm Dialogs */}
            {showZimmetConfirm && (
                <ConfirmDialog
                    isOpen={showZimmetConfirm}
                    title="Zimmet Atama"
                    message="Fatura kaydedildi. Faturadaki malzemeleri şimdi zimmetlemek ister misiniz?"
                    confirmText="Evet, Zimmetle"
                    cancelText="Hayır, Daha Sonra"
                    onConfirm={() => { setShowZimmetConfirm(false); finalizeSave(true); }}
                    onCancel={() => { setShowZimmetConfirm(false); finalizeSave(false); }}
                />
            )}

            {showSaveConfirm && (
                <ConfirmDialog
                    isOpen={showSaveConfirm}
                    title="Kaydetme Onayı"
                    message="Faturayı kaydetmek istediğinize emin misiniz?"
                    confirmText="Kaydet"
                    cancelText="İptal"
                    onConfirm={confirmSave}
                    onCancel={() => setShowSaveConfirm(false)}
                />
            )}

            {showNewMaterialConfirm && (
                <ConfirmDialog
                    isOpen={showNewMaterialConfirm}
                    title="Yeni Malzeme Onayı"
                    message="Bu yeni malzemeyi kaydetmek ve faturaya eklemek istiyor musunuz?"
                    confirmText="Evet, Kaydet"
                    cancelText="İptal"
                    zIndex={1003}
                    onConfirm={confirmNewMaterialSubmit}
                    onCancel={() => setShowNewMaterialConfirm(false)}
                />
            )}

            {showDeleteConfirm && (
                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    title="Silme Onayı"
                    message="Bu faturayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                    confirmText="Sil"
                    cancelText="İptal"
                    variant="danger"
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}

            <CariModal isOpen={showCariModal} onClose={() => setShowCariModal(false)} onSuccess={() => loadData(1, pageSize, searchTerm)} />

            {/* Invoice Detail Modal */}
            {showDetailModal && selectedDetailFatura && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h2>
                                <div className="flex items-center gap-md">
                                    <Info size={24} style={{ color: 'var(--primary-600)' }} />
                                    Fatura Detayı
                                </div>
                            </h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div className="card" style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Fatura No</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedDetailFatura.faturaNo}</div>
                                </div>
                                <div className="card" style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tarih</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {new Date(selectedDetailFatura.faturaTarihi).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ marginBottom: 'var(--spacing-lg)', background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cari</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedDetailFatura.cariAdi}</div>
                            </div>

                            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Fatura Kalemleri</h3>
                            <div style={{ overflowX: 'auto', marginBottom: 'var(--spacing-lg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <table className="data-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Malzeme</th>
                                            <th>Miktar</th>
                                            <th>Birim Fiyat</th>
                                            <th>KDV</th>
                                            <th>Toplam</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDetailFatura.kalemler && selectedDetailFatura.kalemler.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{item.malzemeAdi}</div>
                                                    {(item.seriNumarasi || item.barkod) && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {item.seriNumarasi && `SN: ${item.seriNumarasi} `}
                                                            {item.barkod && `Barkod: ${item.barkod}`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{item.miktar}</td>
                                                <td>{formatCurrency(item.birimFiyat)}</td>
                                                <td>%{item.kdvOrani}</td>
                                                <td style={{ fontWeight: 600 }}>{formatCurrency(item.toplam || (item.miktar * item.birimFiyat))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-start">
                                <div style={{ flex: 1, marginRight: 'var(--spacing-xl)' }}>
                                    {selectedDetailFatura.aciklama && (
                                        <>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Açıklama</div>
                                            <div style={{ padding: 'var(--spacing-sm)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                                {selectedDetailFatura.aciklama}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="card" style={{ minWidth: '250px', background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)', textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Genel Toplam</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                                        {formatCurrency(selectedDetailFatura.genelToplam)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
