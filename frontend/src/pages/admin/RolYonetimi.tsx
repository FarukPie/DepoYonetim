import { useEffect, useState } from 'react';
import { Shield, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { roleService } from '../../services/api';
import { Role, RoleCreate, PageOption, PermissionOption } from '../../types';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function RolYonetimi() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [availablePages, setAvailablePages] = useState<PageOption[]>([
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'stok-yonetimi', label: 'Stok Yönetimi' },
        { key: 'depo-yonetimi', label: 'Depo Yönetimi' },
        { key: 'musteriler', label: 'Müşteriler & Tedarikçiler' },
        { key: 'satis-fatura', label: 'Satış & Fatura' },
        { key: 'personel', label: 'Personel Yönetimi' },
        { key: 'raporlar', label: 'Raporlar' },
        { key: 'ayarlar', label: 'Ayarlar' }
    ]);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([
        { entity: 'urun', label: 'Ürünler', actions: ['view', 'add', 'edit', 'delete'] },
        { entity: 'depo', label: 'Depolar', actions: ['view', 'add', 'edit', 'delete'] },
        { entity: 'cari', label: 'Cariler', actions: ['view', 'add', 'edit', 'delete'] },
        { entity: 'fatura', label: 'Faturalar', actions: ['view', 'add', 'edit', 'delete'] },
        { entity: 'personel', label: 'Personeller', actions: ['view', 'add', 'edit', 'delete'] },
        { entity: 'user', label: 'Kullanıcılar', actions: ['view', 'add', 'edit', 'delete'] },
        { entity: 'role', label: 'Roller', actions: ['view', 'add', 'edit', 'delete'] }
    ]);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<RoleCreate>({
        name: '',
        description: '',
        pagePermissions: [],
        entityPermissions: {}
    });

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await roleService.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            if (editingRole) {
                await roleService.update(editingRole.id, formData);
            } else {
                await roleService.create(formData);
            }
            loadData();
            closeModal();
            setShowSaveConfirm(false);
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description,
            pagePermissions: [...role.pagePermissions],
            entityPermissions: { ...role.entityPermissions }
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await roleService.delete(deleteTargetId);
            loadData();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Bir hata oluştu');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    const togglePagePermission = (pageKey: string) => {
        setFormData(prev => {
            const pages = prev.pagePermissions.includes(pageKey)
                ? prev.pagePermissions.filter(p => p !== pageKey)
                : [...prev.pagePermissions, pageKey];
            return { ...prev, pagePermissions: pages };
        });
    };

    const toggleEntityPermission = (entity: string, action: string) => {
        setFormData(prev => {
            const currentActions = prev.entityPermissions[entity] || [];
            const newActions = currentActions.includes(action)
                ? currentActions.filter(a => a !== action)
                : [...currentActions, action];

            const newEntityPerms = { ...prev.entityPermissions };
            if (newActions.length > 0) {
                newEntityPerms[entity] = newActions;
            } else {
                delete newEntityPerms[entity];
            }

            return { ...prev, entityPermissions: newEntityPerms };
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingRole(null);
        setFormData({ name: '', description: '', pagePermissions: [], entityPermissions: {} });
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'add': return 'Ekle';
            case 'edit': return 'Düzenle';
            case 'delete': return 'Sil';
            default: return action;
        }
    };

    return (
        <>
            <div className="page-content">
                <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        <span>Rol Ekle</span>
                    </button>
                </div>
                {/* Roles Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
                    {roles.map((role) => (
                        <div key={role.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{role.name}</h3>
                                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {role.description}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                    <button
                                        className="btn btn-icon btn-secondary"
                                        onClick={() => handleEdit(role)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn btn-icon btn-danger"
                                        onClick={() => handleDelete(role.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                    Erişilebilir Sayfalar
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {role.pagePermissions.map(page => (
                                        <span key={page} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                            {availablePages.find(p => p.key === page)?.label || page}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {Object.keys(role.entityPermissions).length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                        İşlem Yetkileri
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {Object.entries(role.entityPermissions).map(([entity, actions]) => (
                                            <span key={entity} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                                {availablePermissions.find(p => p.entity === entity)?.label || entity}: {actions.map(a => getActionLabel(a)).join(', ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>{editingRole ? 'Rol Düzenle' : 'Rol Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Rol Adı *"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Açıklama"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sayfa Erişim Yetkileri</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-sm)' }}>
                                        {availablePages.map(page => (
                                            <label
                                                key={page.key}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-xs)',
                                                    padding: 'var(--spacing-xs)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    backgroundColor: formData.pagePermissions.includes(page.key) ? 'var(--bg-tertiary)' : 'transparent'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.pagePermissions.includes(page.key)}
                                                    onChange={() => togglePagePermission(page.key)}
                                                />
                                                <span style={{ fontSize: '0.875rem' }}>{page.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">İşlem Yetkileri</label>
                                    <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                        {availablePermissions.map(perm => (
                                            <div key={perm.entity} style={{ marginBottom: 'var(--spacing-md)' }}>
                                                <h5 style={{ margin: '0 0 var(--spacing-xs)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                                    {perm.label}
                                                </h5>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                                    {perm.actions.map(action => (
                                                        <label
                                                            key={action}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 'var(--spacing-xs)',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={(formData.entityPermissions[perm.entity] || []).includes(action)}
                                                                onChange={() => toggleEntityPermission(perm.entity, action)}
                                                            />
                                                            <span style={{ fontSize: '0.875rem' }}>{getActionLabel(action)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={18} />
                                    <span>{editingRole ? 'Güncelle' : 'Kaydet'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message={editingRole ? 'Bu rolü güncellemek istediğinize emin misiniz?' : 'Yeni rol eklemek istediğinize emin misiniz?'}
                confirmText={editingRole ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu rolü silmek istediğinize emin misiniz?"
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="info"
            />
        </>
    );
}
