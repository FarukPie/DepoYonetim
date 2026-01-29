import { useEffect, useState } from 'react';
import { FileText, Filter, Search } from 'lucide-react';
import { logService, userService } from '../../services/api';
import { SystemLog, User } from '../../types';

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

    const filteredLogs = logs.filter(log =>
        (log.details?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

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
    const entityTypes = ['Personel', 'Urun', 'Depo', 'Kategori', 'Cari', 'Fatura', 'Zimmet', 'Talep', 'User', 'Role'];

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>
                        <FileText size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                        Sistem Logları
                    </h1>
                    <p>Sistemdeki tüm aktivitelerin kaydı</p>
                </div>
            </header>

            <div className="page-content">
                {/* Filters */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                            <Search style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                                width: '18px',
                                height: '18px'
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Log ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
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
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                    <div className="stat-card">
                        <div className="stat-card-value">{logs.length}</div>
                        <div className="stat-card-label">Toplam Log</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-info)' }}>
                            {logs.filter(l => l.action === 'Login').length}
                        </div>
                        <div className="stat-card-label">Giriş</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-success)' }}>
                            {logs.filter(l => l.action === 'Create').length}
                        </div>
                        <div className="stat-card-label">Ekleme</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-warning)' }}>
                            {logs.filter(l => l.action === 'Update').length}
                        </div>
                        <div className="stat-card-label">Güncelleme</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value" style={{ color: 'var(--accent-error)' }}>
                            {logs.filter(l => l.action === 'Delete').length}
                        </div>
                        <div className="stat-card-label">Silme</div>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Kullanıcı</th>
                                    <th>İşlem</th>
                                    <th>Varlık</th>
                                    <th>Detay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {new Date(log.timestamp).toLocaleString('tr-TR')}
                                            </td>
                                            <td style={{ color: 'var(--text-primary)' }}>{log.userName}</td>
                                            <td>
                                                <span className={`badge ${getActionBadge(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {log.entityType}
                                                    {log.entityId && ` #${log.entityId}`}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--spacing-xl)' }}>
                                            Log bulunamadı
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
