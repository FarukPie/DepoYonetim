import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, X, Building2, Edit, Trash2, Eye } from 'lucide-react';
import { cariService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Cari } from '../types';
import { DataTable, Column } from '../components/shared/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import CariModal from '../components/shared/CariModal';

export default function Cariler() {
    const { hasEntityPermission } = useAuth();
    const [cariler, setCariler] = useState<Cari[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCari, setEditingCari] = useState<Cari | null>(null);
    const [viewingCari, setViewingCari] = useState<Cari | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Pagination State
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const canAdd = hasEntityPermission('cari', 'add');
    const canEdit = hasEntityPermission('cari', 'edit');
    const canDelete = hasEntityPermission('cari', 'delete');

    useEffect(() => {
        loadData(page, pageSize, searchTerm);
    }, [page, pageSize]);

    const loadData = async (currentPage: number, currentPageSize: number, search: string) => {
        setIsLoading(true);
        try {
            const result = await cariService.getPaged(currentPage, currentPageSize, search);
            setCariler(result.items);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
        loadData(1, pageSize, term);
    };

    const handleEdit = (cari: Cari) => {
        setEditingCari(cari);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingCari(null);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingCari(null);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await cariService.delete(deleteId);
            loadData(page, pageSize, searchTerm);
        } catch (error: any) {
            console.error('Silme hatası:', error);
            if (error.response?.data?.message) {
                alert('Hata: ' + error.response.data.message);
            } else {
                alert('Silme sırasında bir hata oluştu. İlişkili faturalar olabilir.');
            }
        }
        setShowDeleteConfirm(false);
        setDeleteId(null);
    };

    const handleRowClick = useCallback((cari: Cari) => {
        setViewingCari(cari);
        setShowViewModal(true);
    }, []);

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingCari(null);
    };

    // Memoize columns to prevent DataTable re-renders
    const columns: Column<Cari>[] = useMemo(() => [
        {
            header: 'Firma Adı',
            render: (cari: Cari) => (
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cari.firmaAdi}>
                    {cari.firmaAdi}
                </div>
            )
        },
        { header: 'Hastane Kodu', accessor: 'hastaneKod' as keyof Cari, render: (cari: Cari) => cari.hastaneKod || '-' },
        { header: 'Ticaret Sicil No', accessor: 'ticaretSicilNo' as keyof Cari, render: (cari: Cari) => cari.ticaretSicilNo || '-' },
        { header: 'Vergi No', accessor: 'vergiNo' as keyof Cari, render: (cari: Cari) => cari.vergiNo || '-' },
        { header: 'İl', accessor: 'il' as keyof Cari, render: (cari: Cari) => cari.il || '-' },
        { header: 'İlçe', accessor: 'ilce' as keyof Cari, render: (cari: Cari) => cari.ilce || '-' },
        { header: 'Vergi Dairesi', accessor: 'vergiDairesi' as keyof Cari, render: (cari: Cari) => cari.vergiDairesi || '-' },
        {
            header: 'Adres',
            render: (cari: Cari) => (
                <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cari.adres}>
                    {cari.adres || '-'}
                </div>
            )
        },
        { header: 'Telefon', accessor: 'telefon' as keyof Cari, render: (cari: Cari) => cari.telefon || '-' },
        { header: 'E-Posta', accessor: 'email' as keyof Cari, render: (cari: Cari) => cari.email || '-' },
        { header: 'Yetkili Kişi', accessor: 'yetkiliKisi' as keyof Cari, render: (cari: Cari) => cari.yetkiliKisi || '-' },
        ...((canEdit || canDelete) ? [{
            header: 'İşlemler',
            render: (cari: Cari) => (
                <div className="flex gap-sm">
                    <button className="btn btn-icon btn-primary" onClick={() => handleRowClick(cari)} title="Görüntüle">
                        <Eye size={16} />
                    </button>
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => handleEdit(cari)} title="Düzenle">
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => handleDelete(cari.id)} title="Sil">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }] : [])
    ], [canEdit, canDelete, handleRowClick]);

    return (
        <>
            <div className="page-content">
                <DataTable
                    title="Cariler"
                    columns={columns}
                    data={cariler}
                    searchable={true}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari ara..."
                    onAdd={canAdd ? handleAdd : undefined}
                    addButtonLabel="Cari Ekle"
                    emptyMessage="Hiç cari bulunamadı."
                    rowClickable={true}
                    onRowClick={handleRowClick}
                    serverSide={true}
                    totalCount={totalCount}
                    paginationParams={{ pageNumber: page, pageSize }}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                />
            </div>

            <CariModal
                isOpen={showModal}
                onClose={handleModalClose}
                onSuccess={() => loadData(page, pageSize, searchTerm)}
                editingCari={editingCari}
            />

            {/* View Modal */}
            {showViewModal && viewingCari && (
                <div className="modal-overlay" onClick={closeViewModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Building2 size={20} /> {viewingCari.firmaAdi}
                            </h2>
                            <button className="modal-close" onClick={closeViewModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                                <div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tip</div>
                                        <span className={`badge ${viewingCari.tip === 'Tedarikci' ? 'badge-info' : 'badge-success'}`}>
                                            {viewingCari.tip === 'Tedarikci' ? 'Tedarikçi' : 'Müşteri'}
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Hastane Kodu</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.hastaneKod || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vergi No</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.vergiNo || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vergi Dairesi</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.vergiDairesi || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ticaret Sicil No</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.ticaretSicilNo || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>İl / İlçe</div>
                                        <div style={{ color: 'var(--text-primary)' }}>
                                            {viewingCari.il ? `${viewingCari.il} / ${viewingCari.ilce || '-'}` : '-'}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Adres</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.adres || '-'}</div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Yetkili Kişi</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.yetkiliKisi || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Yetkili Telefon</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.yetkiliTelefon || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Telefon</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.telefon || '-'}</div>
                                    </div>
                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>E-posta</div>
                                        <div style={{ color: 'var(--text-primary)' }}>{viewingCari.email || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {canEdit && (
                                <button type="button" className="btn btn-secondary" onClick={() => { closeViewModal(); handleEdit(viewingCari); }}>
                                    <Edit size={16} style={{ marginRight: '6px' }} /> Düzenle
                                </button>
                            )}
                            <button type="button" className="btn btn-primary" onClick={closeViewModal}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Cari Silme"
                message="Bu cariyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="Sil"
                variant="danger"
            />
        </>
    );
}
