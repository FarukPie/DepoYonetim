import { useEffect, useState, useMemo } from 'react';
import { FileText, Filter, LogIn, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { logService, userService } from '../../services/api';
import { SystemLog, User } from '../../types';
import { DataTable, Column } from '../../components/shared/DataTable';

export default function Loglar() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        userId: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadLogs();
    }, [filters]);

    const loadInitialData = async () => {
        try {
            const usersData = await userService.getAll();
            setUsers(usersData);
        } catch (error) {
            console.error('Kullanıcılar yüklenirken hata:', error);
        }
    };

    const loadLogs = async () => {
        try {
            const filterParams: { action?: string; entityType?: string; userId?: number } = {};
            if (filters.action) filterParams.action = filters.action;
            if (filters.entityType) filterParams.entityType = filters.entityType;
            if (filters.userId) filterParams.userId = Number(filters.userId);

            const logsData = await logService.getAll(Object.keys(filterParams).length > 0 ? filterParams : undefined);
            setLogs(logsData);
        } catch (error) {
            console.error('Loglar yüklenirken hata:', error);
        }
    };

    const filteredLogs = useMemo(() => logs.filter(log =>
        (log.details?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    ), [logs, searchTerm]);

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'Login': return 'badge-info';
            case 'Logout': return 'badge-neutral';
            case 'Create': return 'badge-success';
            case 'Update': return 'badge-warning';
            case 'Delete': return 'badge-error';
            case 'Approve': return 'badge-success';
            case 'Reject': return 'badge-error';
            default: return 'badge-neutral';
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'Login': return 'Giriş';
            case 'Logout': return 'Çıkış';
            case 'Create': return 'Ekleme';
            case 'Update': return 'Güncelleme';
            case 'Delete': return 'Silme';
            case 'Approve': return 'Onay';
            case 'Reject': return 'Red';
            default: return action;
        }
    };

    const actions = ['Login', 'Logout', 'Create', 'Update', 'Delete', 'Approve', 'Reject'];
    const entityTypes = ['Personel', 'MalzemeKalemi', 'Depo', 'Kategori', 'Cari', 'Fatura', 'Zimmet', 'Talep', 'User', 'Role'];

    const columns: Column<SystemLog>[] = [
        {
            header: 'Tarih',
            render: (log) => (
                <span style={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString('tr-TR')}
                </span>
            )
        },
        { header: 'Kullanıcı', accessor: 'userName' },
        {
            header: 'İşlem',
            render: (log) => (
                <span className={`badge ${getActionBadge(log.action)}`}>
                    {getActionLabel(log.action)}
                </span>
            )
        },
        {
            header: 'Varlık',
            render: (log) => (
                <span className="badge badge-neutral">
                    {log.entityType}
                    {log.entityId && ` #${log.entityId}`}
                </span>
            )
        },
        {
            header: 'Detay',
            render: (log) => (
                <span style={{ color: 'var(--text-muted)', maxWidth: '300px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                    {log.details}
                </span>
            )
        }
    ];

    return (
        <>
            <div className="page-content">
                {/* Stats */}
                <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon">
                            <FileText size={24} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-value">{logs.length}</div>
                            <div className="stat-card-label">Toplam Log</div>
                        </div>
                    </div>
                    <div className="stat-card info">
                        <div className="stat-card-icon info">
                            <LogIn size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-value">{logs.filter(l => l.action === 'Login').length}</div>
                            <div className="stat-card-label">Giriş</div>
                        </div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-card-icon success">
                            <PlusCircle size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-value">{logs.filter(l => l.action === 'Create').length}</div>
                            <div className="stat-card-label">Ekleme</div>
                        </div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-card-icon warning">
                            <Edit size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-value">{logs.filter(l => l.action === 'Update').length}</div>
                            <div className="stat-card-label">Güncelleme</div>
                        </div>
                    </div>
                    <div className="stat-card error">
                        <div className="stat-card-icon error">
                            <Trash2 size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-value">{logs.filter(l => l.action === 'Delete').length}</div>
                            <div className="stat-card-label">Silme</div>
                        </div>
                    </div>
                </div>

                <DataTable
                    title="Sistem Logları"
                    columns={columns}
                    data={filteredLogs}
                    searchable={true}
                    onSearch={setSearchTerm}
                    searchPlaceholder="Log ara..."
                    emptyMessage="Log bulunamadı."
                    extraToolbarContent={
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                                <select
                                    className="form-input"
                                    value={filters.action}
                                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                    style={{ minWidth: '130px' }}
                                >
                                    <option value="">Tüm İşlemler</option>
                                    {actions.map(action => (
                                        <option key={action} value={action}>{getActionLabel(action)}</option>
                                    ))}
                                </select>
                                <select
                                    className="form-input"
                                    value={filters.entityType}
                                    onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                                    style={{ minWidth: '130px' }}
                                >
                                    <option value="">Tüm Varlıklar</option>
                                    {entityTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <select
                                    className="form-input"
                                    value={filters.userId}
                                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                    style={{ minWidth: '150px' }}
                                >
                                    <option value="">Tüm Kullanıcılar</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    }
                />
            </div>
        </>
    );
}
