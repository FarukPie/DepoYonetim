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
                {data.length > 0 || !isLoading ? (
                    <ReactDataTable
                        data={data}
                        columns={dtColumns}
                        slots={slots}
                        options={{
                            searching: false, // Disable DataTables built-in search as we use custom logic
                            paging: true,
                            dom: 't<"datatable-footer"ilp>', // Custom layout: Table -> Info + Length + Pagination in footer
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
