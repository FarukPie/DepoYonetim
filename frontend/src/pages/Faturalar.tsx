import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Download, Filter, Search, X, Package, ChevronDown, ChevronUp, Edit, Upload, FileText } from 'lucide-react';
import { faturaService, cariService, urunService, kategoriService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Fatura, Cari, Urun, FaturaKalemiCreate, Kategori } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import CariModal from '../components/shared/CariModal';
import ConfirmDialog from '../components/ConfirmDialog';

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
    const [searchTerm, setSearchTerm] = useState('');
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
        marka: '',
        model: '',
        seriNumarasi: '',
        barkod: '',
        birim: 'Adet'
    });

    // Malzeme seçim filtreleri
    const [productCategoryFilter, setProductCategoryFilter] = useState('');
    const [productSerialFilter, setProductSerialFilter] = useState('');
    const [productBarcodeFilter, setProductBarcodeFilter] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Zimmet confirmation state
    const [showZimmetConfirm, setShowZimmetConfirm] = useState(false);
    const navigate = useNavigate();

    const canAdd = hasEntityPermission('fatura', 'add');
    const canEdit = hasEntityPermission('fatura', 'edit');
    const canDelete = hasEntityPermission('fatura', 'delete');

    useEffect(() => {
        loadData();
    }, [filterCari, filterStartDate, filterEndDate]);

    const loadData = async () => {
        try {
            const [faturalarData, carilerData, urunlerData, kategorilerData] = await Promise.all([
                faturaService.getAll(),
                cariService.getAll(),
                urunService.getAll(),
                kategoriService.getAll()
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
            setKategoriler(kategorilerData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const filteredFaturalar = useMemo(() => faturalar.filter(f =>
        f.faturaNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cariAdi.toLowerCase().includes(searchTerm.toLowerCase())
    ), [faturalar, searchTerm]);

    // Stable data for DataTable - only update when modal is closed to prevent flickering
    const [stableTableData, setStableTableData] = useState<Fatura[]>([]);
    useEffect(() => {
        if (!showModal && !showProductModal && !showCariModal && !showNewMaterialModal) {
            setStableTableData(filteredFaturalar);
        }
    }, [filteredFaturalar, showModal, showProductModal, showCariModal, showNewMaterialModal]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    // Aktif filtre kontrolü
    const hasActiveProductFilter = useMemo(() => {
        return productSearchTerm.trim() !== '' ||
            productCategoryFilter !== '' ||
            productSerialFilter.trim() !== '' ||
            productBarcodeFilter.trim() !== '';
    }, [productSearchTerm, productCategoryFilter, productSerialFilter, productBarcodeFilter]);

    // Filtrelenmiş ürünler - sadece filtre uygulandığında göster
    const filteredProducts = useMemo(() => {
        if (!hasActiveProductFilter) return [];
        return urunler.filter(u => {
            const matchesSearch = !productSearchTerm.trim() ||
                u.ad.toLowerCase().includes(productSearchTerm.toLowerCase());
            const matchesCategory = !productCategoryFilter ||
                u.kategoriId === parseInt(productCategoryFilter);
            const matchesSerial = !productSerialFilter.trim() ||
                (u as any).seriNumarasi?.toLowerCase().includes(productSerialFilter.toLowerCase());
            const matchesBarcode = !productBarcodeFilter.trim() ||
                u.barkod?.toLowerCase().includes(productBarcodeFilter.toLowerCase());
            return matchesSearch && matchesCategory && matchesSerial && matchesBarcode;
        });
    }, [urunler, productSearchTerm, productCategoryFilter, productSerialFilter, productBarcodeFilter, hasActiveProductFilter]);

    // Satır toplam hesaplama
    const calculateKalemToplam = (kalem: FaturaKalemiCreate) => {
        const araToplam = kalem.miktar * kalem.birimFiyat;
        const indirimTutari = araToplam * (kalem.indirimOrani / 100);
        const kdvTutari = (araToplam - indirimTutari) * (kalem.kdvOrani / 100);
        return araToplam - indirimTutari + kdvTutari;
    };

    // Genel toplam hesaplama
    const genelToplam = useMemo(() => {
        return kalemler.reduce((total, kalem) => total + calculateKalemToplam(kalem), 0);
    }, [kalemler]);

    // Ürün seçim toggle
    const toggleProductSelection = (productId: number) => {
        const newSet = new Set(selectedProductIds);
        if (newSet.has(productId)) {
            newSet.delete(productId);
        } else {
            newSet.add(productId);
        }
        setSelectedProductIds(newSet);
    };

    // Seçilen ürünleri fatura kalemlerine ekle
    const addSelectedProducts = () => {
        const newKalemler = Array.from(selectedProductIds).map(productId => {
            const urun = urunler.find(u => u.id === productId);
            return {
                urunId: productId,
                urunAdi: urun?.ad || '',
                miktar: 1,
                birimFiyat: urun?.maliyet || 0,
                indirimOrani: 0,
                kdvOrani: 20
            };
        });
        setKalemler([...kalemler, ...newKalemler]);
        setSelectedProductIds(new Set());
        setProductSearchTerm('');
        setShowProductModal(false);
    };

    const addKalem = () => {
        setKalemler([...kalemler, { urunAdi: '', miktar: 1, birimFiyat: 0, indirimOrani: 0, kdvOrani: 20 }]);
    };

    // Yeni malzeme kaydetme handler
    const handleNewMaterialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createData = {
                ad: `${newMaterialFormData.marka} ${newMaterialFormData.model}`.trim(),
                marka: newMaterialFormData.marka,
                model: newMaterialFormData.model,
                seriNumarasi: newMaterialFormData.seriNumarasi,
                barkod: newMaterialFormData.barkod,
                birim: newMaterialFormData.birim as 'Adet' | 'Kg' | 'Kutu',
                kategoriId: kategoriler.length > 0 ? kategoriler[0].id : 1,
                depoId: undefined,
                stokMiktari: 1,
                maliyet: 0,
                kdvOrani: 18,
                garantiSuresiAy: 24,
                bozuldugundaBakimTipi: 'Bakim' as 'Kalibrasyon' | 'Bakim',
                ekParcaVar: false,
                durum: 'Pasif' as const
            };

            const createdUrun = await urunService.create(createData);

            // Ürünler listesini güncelle
            setUrunler([...urunler, createdUrun]);

            // Yeni malzemeyi otomatik olarak fatura kalemine ekle
            const newKalem: FaturaKalemiCreate = {
                urunId: createdUrun.id,
                urunAdi: createdUrun.ad,
                miktar: 1,
                birimFiyat: createdUrun.maliyet || 0,
                indirimOrani: 0,
                kdvOrani: 20
            };
            setKalemler([...kalemler, newKalem]);

            // Modalı kapat
            setShowNewMaterialModal(false);
            setNewMaterialFormData({ marka: '', model: '', seriNumarasi: '', barkod: '', birim: 'Adet' });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Fatura kalemlerinde miktar ve KDV kontrolü
        if (kalemler.length > 0) {
            for (let i = 0; i < kalemler.length; i++) {
                const kalem = kalemler[i];
                if (bulkModeIndexes.has(i) && (!kalem.miktar || kalem.miktar <= 0)) {
                    alert(`${i + 1}. kalem için miktar girilmedi. Lütfen geçerli bir miktar girin.`);
                    return;
                }
                if (kalem.kdvOrani === undefined || kalem.kdvOrani === null || isNaN(kalem.kdvOrani)) {
                    alert(`${i + 1}. kalem için KDV oranı girilmedi. Lütfen geçerli bir KDV oranı girin.`);
                    return;
                }
            }
        }

        // Sadece yeni fatura eklerken sor (düzenlemede sorma)
        if (!editingId) {
            setShowZimmetConfirm(true);
        } else {
            finalizeSave(false);
        }
    };

    const finalizeSave = async (shouldAssign: boolean) => {
        try {
            const data = {
                faturaNo: formData.faturaNo,
                cariId: parseInt(formData.cariId),
                cariAdi: cariler.find(c => c.id === parseInt(formData.cariId))?.firmaAdi || '',
                faturaTarihi: formData.faturaTarihi,
                aciklama: formData.aciklama || undefined,
                kalemler: kalemler.map((k, i) => ({
                    ...k,
                    id: i + 1,
                    toplam: k.miktar * k.birimFiyat * (1 - k.indirimOrani / 100) * (1 + k.kdvOrani / 100)
                })),
            };

            if (editingId) {
                await faturaService.update(editingId, data);
            } else {
                await faturaService.create(data);
            }

            loadData();
            closeModal();

            if (shouldAssign) {
                // Zimmet sayfasına yönlendir ve kalemleri taşı
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

        // Fatura kalemlerini form formatına dönüştür
        if (fatura.kalemler && fatura.kalemler.length > 0) {
            setKalemler(fatura.kalemler.map(k => ({
                urunId: k.urunId,
                urunAdi: k.urunAdi,
                miktar: k.miktar,
                birimFiyat: k.birimFiyat,
                indirimOrani: k.indirimOrani,
                kdvOrani: k.kdvOrani
            })));
        } else {
            setKalemler([]);
        }

        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu faturayı silmek istediğinize emin misiniz?')) {
            try {
                await faturaService.delete(id);
                loadData();
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Silme sırasında bir hata oluştu.');
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ faturaNo: '', cariId: '', faturaTarihi: '', aciklama: '' });
        setKalemler([]);
        setProductSearchTerm('');
        setSelectedProductIds(new Set());
        setProductCategoryFilter('');
        setProductSerialFilter('');
        setProductBarcodeFilter('');
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
                setFormData({
                    faturaNo: data.faturaNo,
                    cariId: data.cariId.toString(),
                    faturaTarihi: data.faturaTarihi.split('T')[0],
                    aciklama: data.aciklama || ''
                });

                if (data.kalemler && data.kalemler.length > 0) {
                    setKalemler(data.kalemler.map((k: any) => {
                        const urun = urunler.find(u => u.id === k.urunId);
                        return {
                            urunId: k.urunId,
                            urunAdi: urun ? urun.ad : '',
                            miktar: k.miktar,
                            birimFiyat: k.birimFiyat,
                            indirimOrani: k.indirimOrani,
                            kdvOrani: k.kdvOrani
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
            header: 'Ara Toplam',
            render: (fatura) => formatCurrency(fatura.araToplam)
        },
        {
            header: 'İndirim',
            render: (fatura) => <span className="text-error">{formatCurrency(fatura.toplamIndirim)}</span>
        },
        {
            header: 'KDV',
            render: (fatura) => formatCurrency(fatura.toplamKdv)
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


                <DataTable
                    title="Faturalar"
                    columns={columns}
                    data={stableTableData}
                    searchable={true}
                    onSearch={(term) => setSearchTerm(term)}
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
                            <button className={`btn ${showFilter ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilter(!showFilter)}>
                                <Filter size={18} /> Filtrele
                            </button>
                        </div>
                    }
                />
            </div >

            {/* Modal */}
            {
                showModal && (
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
                                            <button type="button" className="btn btn-outline btn-sm mt-2" style={{ marginTop: '8px', width: '100%' }} onClick={() => setShowCariModal(true)}>
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
                                                <button type="button" className="btn btn-primary" onClick={() => {
                                                    setNewMaterialFormData({ marka: '', model: '', seriNumarasi: '', barkod: '', birim: 'Adet' });
                                                    setShowNewMaterialModal(true);
                                                }}>
                                                    <Plus size={16} style={{ marginRight: '6px' }} /> Yeni Malzeme Kaydet
                                                </button>
                                                <button type="button" className="btn btn-outline" onClick={() => setShowProductModal(true)}>
                                                    <Package size={16} style={{ marginRight: '6px' }} /> Malzeme Ekle
                                                </button>
                                            </div>
                                        </div>

                                        {kalemler.length > 0 ? (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="data-table" style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '30%' }}>Ürün Adı</th>
                                                            <th style={{ width: '15%' }}>Miktar</th>
                                                            <th style={{ width: '15%' }}>Birim Fiyat</th>
                                                            <th style={{ width: '10%' }}>İndirim %</th>
                                                            <th style={{ width: '10%' }}>KDV %</th>
                                                            <th style={{ width: '14%' }}>Toplam</th>
                                                            <th style={{ width: '6%' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {kalemler.map((kalem, index) => {
                                                            const urun = urunler.find(u => u.id === kalem.urunId);
                                                            const isExpanded = expandedRowIndex === index;

                                                            return (
                                                                <React.Fragment key={index}>
                                                                    <tr>
                                                                        <td>
                                                                            <div style={{ position: 'relative' }}>
                                                                                <input type="text" className="form-input" value={kalem.urunAdi}
                                                                                    readOnly
                                                                                    onClick={() => setExpandedRowIndex(isExpanded ? null : index)}
                                                                                    placeholder="Ürün seçiniz"
                                                                                    style={{ width: '100%', cursor: 'pointer', paddingRight: '30px' }} />
                                                                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                                                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                                </span>
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
                                                                            <input type="number" className="form-input" min="0" step="0.01" value={kalem.birimFiyat || ''}
                                                                                onChange={(e) => updateKalem(index, 'birimFiyat', parseFloat(e.target.value) || 0)}
                                                                                style={{ width: '100%' }} />
                                                                        </td>
                                                                        <td>
                                                                            <input type="number" className="form-input" min="0" max="100" value={kalem.indirimOrani || ''}
                                                                                onChange={(e) => updateKalem(index, 'indirimOrani', parseFloat(e.target.value) || 0)}
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
                                                                            <td colSpan={7} style={{ background: 'var(--bg-tertiary)', padding: 'var(--spacing-md)' }}>
                                                                                <div className="grid-3" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                                                    <div><strong style={{ color: 'var(--text-primary)' }}>Marka:</strong> {urun.marka || '-'}</div>
                                                                                    <div><strong style={{ color: 'var(--text-primary)' }}>Model:</strong> {urun.model || '-'}</div>
                                                                                    <div><strong style={{ color: 'var(--text-primary)' }}>Seri Numarası:</strong> {urun.seriNumarasi || '-'}</div>
                                                                                    <div><strong style={{ color: 'var(--text-primary)' }}>Barkod Numarası:</strong> {urun.barkod || '-'}</div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>

                                                {/* Genel Toplam */}
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
                                                <p>Henüz malzeme eklenmedi. "Malzeme Ekle" butonunu kullanarak ürün ekleyebilirsiniz.</p>
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
                )
            }
            {/* Filter Modal */}
            {
                showFilter && (
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
                )
            }

            {/* Use the shared CariModal */}
            <CariModal
                isOpen={showCariModal}
                onClose={() => setShowCariModal(false)}
                onSuccess={loadData}
            />

            {/* Product Selection Modal */}
            {showProductModal && (
                <div className="modal-overlay" onClick={() => { setShowProductModal(false); setProductSearchTerm(''); setSelectedProductIds(new Set()); setProductCategoryFilter(''); setProductSerialFilter(''); setProductBarcodeFilter(''); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>
                                <div className="flex items-center gap-md">
                                    <Package size={24} style={{ color: 'var(--primary-400)' }} />
                                    Malzeme Seç
                                </div>
                            </h2>
                            <button className="modal-close" onClick={() => { setShowProductModal(false); setProductSearchTerm(''); setSelectedProductIds(new Set()); setProductCategoryFilter(''); setProductSerialFilter(''); setProductBarcodeFilter(''); }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Filtre Alanları - Kompakt */}
                            <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', alignItems: 'center' }}>
                                    {/* Ürün Adı Arama */}
                                    <div style={{ position: 'relative' }}>
                                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ürün adı ara..."
                                            value={productSearchTerm}
                                            onChange={(e) => setProductSearchTerm(e.target.value)}
                                            style={{ paddingLeft: '32px', height: '36px', fontSize: '0.875rem' }}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Kategori Filtresi */}
                                    <select
                                        className="form-select"
                                        value={productCategoryFilter}
                                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                                        style={{ height: '36px', fontSize: '0.875rem' }}
                                    >
                                        <option value="">Kategori Seçiniz</option>
                                        {kategoriler.map((k) => (
                                            <option key={k.id} value={k.id}>{k.ad}</option>
                                        ))}
                                    </select>

                                    {/* Seri Numarası Filtresi */}
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Seri numarası..."
                                        value={productSerialFilter}
                                        onChange={(e) => setProductSerialFilter(e.target.value)}
                                        style={{ height: '36px', fontSize: '0.875rem' }}
                                    />

                                    {/* Barkod Filtresi */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Barkod..."
                                            value={productBarcodeFilter}
                                            onChange={(e) => setProductBarcodeFilter(e.target.value)}
                                            style={{ height: '36px', fontSize: '0.875rem', flex: 1 }}
                                        />
                                        {/* Filtreleri Temizle Butonu (Aktifse) */}
                                        {hasActiveProductFilter && (
                                            <button
                                                type="button"
                                                className="btn btn-icon btn-secondary"
                                                onClick={() => {
                                                    setProductSearchTerm('');
                                                    setProductCategoryFilter('');
                                                    setProductSerialFilter('');
                                                    setProductBarcodeFilter('');
                                                }}
                                                title="Filtreleri Temizle"
                                                style={{ height: '36px', width: '36px', flexShrink: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {!hasActiveProductFilter && (
                                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px', fontSize: '0.75rem', textAlign: 'center' }}>
                                        * Listelemek için filtre kullanın
                                    </small>
                                )}
                            </div>

                            {/* Product List */}
                            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                {!hasActiveProductFilter ? (
                                    <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Filter size={32} style={{ marginBottom: 'var(--spacing-sm)', opacity: 0.5 }} />
                                        <p>Ürünleri listelemek için yukarıdaki filtre alanlarından en az birini kullanın.</p>
                                    </div>
                                ) : filteredProducts.length === 0 ? (
                                    <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <Package size={32} style={{ marginBottom: 'var(--spacing-sm)', opacity: 0.5 }} />
                                        <p>Aramanızla eşleşen ürün bulunamadı.</p>
                                    </div>
                                ) : (
                                    <table className="data-table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}></th>
                                                <th>Ürün Adı</th>
                                                <th>Barkod</th>
                                                <th>Stok</th>
                                                <th>Maliyet</th>
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
                                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{urun.barkod || '-'}</td>
                                                    <td>{urun.stokMiktari} {urun.birim}</td>
                                                    <td style={{ color: 'var(--primary-400)' }}>{formatCurrency(urun.maliyet)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Selection Info */}
                            {selectedProductIds.size > 0 && (
                                <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--primary-400)' }}>
                                    <strong>{selectedProductIds.size}</strong> ürün seçildi
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowProductModal(false); setProductSearchTerm(''); setSelectedProductIds(new Set()); setProductCategoryFilter(''); setProductSerialFilter(''); setProductBarcodeFilter(''); }}>
                                İptal
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={selectedProductIds.size === 0}
                                onClick={addSelectedProducts}
                            >
                                <Plus size={16} style={{ marginRight: '6px' }} />
                                Seçilenleri Ekle ({selectedProductIds.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Yeni Malzeme Kaydet Modal */}
            {showNewMaterialModal && (
                <div className="modal-overlay" onClick={() => setShowNewMaterialModal(false)} style={{ zIndex: 1100 }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ zIndex: 1101 }}>
                        <div className="modal-header">
                            <h2>Yeni Malzeme Kaydet</h2>
                            <button className="modal-close" onClick={() => setShowNewMaterialModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleNewMaterialSubmit}>
                            <div className="modal-body">
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Marka</label>
                                        <input type="text" className="form-input" required value={newMaterialFormData.marka}
                                            placeholder="Örn: Apple, Lenovo, HP"
                                            onChange={(e) => setNewMaterialFormData({ ...newMaterialFormData, marka: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Model</label>
                                        <input type="text" className="form-input" required value={newMaterialFormData.model}
                                            placeholder="Örn: MacBook Pro 14, ThinkPad X1"
                                            onChange={(e) => setNewMaterialFormData({ ...newMaterialFormData, model: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Seri Numarası</label>
                                        <input type="text" className="form-input" value={newMaterialFormData.seriNumarasi}
                                            placeholder="Örn: SN123456789"
                                            onChange={(e) => setNewMaterialFormData({ ...newMaterialFormData, seriNumarasi: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Barkod Numarası</label>
                                        <input type="text" className="form-input" value={newMaterialFormData.barkod}
                                            placeholder="Örn: 8699999999999"
                                            onChange={(e) => setNewMaterialFormData({ ...newMaterialFormData, barkod: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Birim</label>
                                    <select className="form-select" value={newMaterialFormData.birim}
                                        onChange={(e) => setNewMaterialFormData({ ...newMaterialFormData, birim: e.target.value })}>
                                        <option value="Adet">Adet</option>
                                        <option value="Kutu">Kutu</option>
                                        <option value="Kg">Kg</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowNewMaterialModal(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet ve Ekle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Zimmet Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showZimmetConfirm}
                title="Zimmetleme İşlemi"
                message="Fatura başarıyla oluşturulacak. Faturadaki malzemeleri hemen zimmetlemek ister misiniz?"
                confirmText="Evet, Zimmetle"
                cancelText="Hayır, Sadece Kaydet"
                onConfirm={() => {
                    setShowZimmetConfirm(false);
                    finalizeSave(true);
                }}
                onCancel={() => {
                    setShowZimmetConfirm(false);
                    finalizeSave(false);
                }}
                variant="info"
            />
        </>
    );
}
