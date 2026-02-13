import { ReactNode, useMemo, useState, useRef, useCallback, memo } from 'react';
import ReactDataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import { Plus, Search } from 'lucide-react';

// Initialize the DataTables library
ReactDataTable.use(DT);

export interface Column<T> {
    header: string;
    accessor?: keyof T;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    searchable?: boolean;
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    addButtonLabel?: string;
    onAdd?: () => void;
    title?: string;
    isLoading?: boolean;
    emptyMessage?: string;
    extraToolbarContent?: ReactNode;
    onRowClick?: (item: T) => void;
    rowClickable?: boolean;
    serverSide?: boolean;
    totalCount?: number;
    paginationParams?: { pageNumber: number; pageSize: number };
    onPageChange?: (page: number, pageSize: number) => void;
}

function DataTableInner<T extends { id: number | string }>({
    columns,
    data,
    searchable = false,
    searchPlaceholder = 'Ara...',
    onAdd,
    addButtonLabel = 'Ekle',
    title,
    isLoading = false,
    emptyMessage = 'Kayıt bulunamadı.',
    extraToolbarContent,
    onSearch,
    onRowClick,
    rowClickable = false,
    serverSide = false,
    totalCount,
    paginationParams,
    onPageChange,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');

    // Store the data in a ref to avoid re-renders of the table
    const dataRef = useRef(data);
    dataRef.current = data;

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (onSearch) {
            onSearch(term);
        }
    }, [onSearch]);

    // Map custom columns to DataTables options - memoize based on column headers only
    const columnHeaders = columns.map(c => c.header).join(',');
    const dtColumns = useMemo(() => columns.map((col) => {
        return {
            title: col.header,
            data: col.accessor ? String(col.accessor) : null,
            className: col.className,
            orderable: true,
        };
    }), [columnHeaders]);

    // Create slots for custom column rendering - memoize based on column headers
    const slots = useMemo(() => {
        const s: any = {};

        columns.forEach((col, index) => {
            if (col.render) {
                // Determine the slot key. 
                // According to docs, we can use column index as key for the slot.
                s[index] = (data: any, row: T) => <>{col.render!(row)}</>;
            }
        });

        return s;
    }, [columnHeaders]);

    const hasToolbar = title || searchable || onAdd || extraToolbarContent;

    // Server-side pagination helpers
    const { pageNumber = 1, pageSize = 10 } = paginationParams || {};
    const totalPages = serverSide && totalCount ? Math.ceil(totalCount / pageSize) : 0;
    const startRecord = serverSide ? (pageNumber - 1) * pageSize + 1 : 0;
    const endRecord = serverSide ? Math.min(pageNumber * pageSize, totalCount || 0) : 0;

    const handlePageChange = (newPage: number) => {
        if (onPageChange && newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage, pageSize);
        }
    };

    if (isLoading) {
        return (
            <div className="card" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                Yükleniyor...
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header / Custom Toolbar */}
            {hasToolbar && (
                <div className="toolbar" style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    {title && <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>}

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        {extraToolbarContent}

                        {searchable && (
                            <div className="search-box" style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="form-input"
                                    style={{ paddingLeft: '36px', width: '250px' }}
                                />
                            </div>
                        )}

                        {onAdd && (
                            <button className="btn btn-primary" onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Plus size={18} /> {addButtonLabel}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* DataTables Instance */}
            <div style={{ padding: '0' }}>
                {data.length > 0 || (serverSide && totalCount && totalCount > 0) ? (
                    <>
                        <ReactDataTable
                            data={data}
                            columns={dtColumns}
                            slots={slots}
                            options={{
                                searching: false, // Disable DataTables built-in search as we use custom logic
                                paging: !serverSide, // Disable built-in paging if serverSide is true
                                info: !serverSide, // Disable built-in info if serverSide is true
                                dom: serverSide ? 't' : 't<"datatable-footer"ilp>', // Only table if serverSide
                                language: {
                                    search: "Ara:",
                                    lengthMenu: "_MENU_ kayıt göster",
                                    info: "_TOTAL_ kayıttan _START_ - _END_ arası gösteriliyor",
                                    infoEmpty: "Kayıt bulunamadı",
                                    infoFiltered: "(_MAX_ kayıt içerisinden filtrelendi)",
                                    zeroRecords: emptyMessage,
                                    paginate: {
                                        first: "İlk",
                                        last: "Son",
                                        next: "Sonraki",
                                        previous: "Önceki"
                                    }
                                },
                                createdRow: (row: any, rowData: any, dataIndex: number) => {
                                    if (rowClickable && onRowClick) {
                                        row.style.cursor = 'pointer';
                                        // Use onclick to ensure single handler and avoid potential duplicates/memory leaks with addEventListener in this context
                                        row.onclick = (e: MouseEvent) => {
                                            const target = e.target as HTMLElement;
                                            // Ignore clicks on buttons, links, or inputs
                                            if (
                                                target.closest('button') ||
                                                target.closest('.btn') ||
                                                target.closest('a') ||
                                                target.closest('input') ||
                                                target.closest('select')
                                            ) {
                                                return;
                                            }

                                            // Use rowData directly provided by DataTables
                                            // This is safer than data[dataIndex] as sorting/filtering might affect indices
                                            onRowClick(rowData);
                                        };
                                    }
                                },
                            }}
                            className="display table w-100"
                        >
                            <thead>
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx}>{col.header}</th>
                                    ))}
                                </tr>
                            </thead>
                        </ReactDataTable>

                        {/* Custom Pagination for Server Side */}
                        {serverSide && totalCount !== undefined && (
                            <div className="datatable-footer" style={{ padding: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-primary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="dataTables_info" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {totalCount} kayıttan {startRecord} - {endRecord} arası gösteriliyor
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        <span>Satır:</span>
                                        <select
                                            className="form-select form-select-sm"
                                            value={pageSize}
                                            onChange={(e) => {
                                                if (onPageChange) {
                                                    onPageChange(1, Number(e.target.value));
                                                }
                                            }}
                                            style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="dataTables_paginate paging_simple_numbers" style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                    <button
                                        className={`btn btn-sm ${pageNumber === 1 ? 'btn-secondary disabled' : 'btn-secondary'}`}
                                        onClick={() => handlePageChange(pageNumber - 1)}
                                        disabled={pageNumber === 1}
                                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                        Önceki
                                    </button>
                                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 600 }}>
                                        {pageNumber} / {totalPages}
                                    </span>
                                    <button
                                        className={`btn btn-sm ${pageNumber === totalPages ? 'btn-secondary disabled' : 'btn-secondary'}`}
                                        onClick={() => handlePageChange(pageNumber + 1)}
                                        disabled={pageNumber === totalPages}
                                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                        Sonraki
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {emptyMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

// Export memoized version to prevent re-renders from parent state changes
export const DataTable = memo(DataTableInner) as typeof DataTableInner;
