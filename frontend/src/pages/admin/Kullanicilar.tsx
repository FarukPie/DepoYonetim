import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { userService, roleService } from '../../services/api';
import { User, Role, UserCreate } from '../../types';
import { DataTable, Column } from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Kullanicilar() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserCreate>({
        username: '',
        password: '',
        email: '',
        fullName: '',
        roleId: 2
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
            const [usersData, rolesData] = await Promise.all([
                userService.getAll(),
                roleService.getAll()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    const filteredUsers = useMemo(() => users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

    // Stable data for DataTable - only update when modal is closed to prevent flickering
    const [stableTableData, setStableTableData] = useState<User[]>([]);
    useEffect(() => {
        if (!showModal) {
            setStableTableData(filteredUsers);
        }
    }, [filteredUsers, showModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            if (editingUser) {
                await userService.update(editingUser.id, {
                    email: formData.email,
                    fullName: formData.fullName,
                    roleId: formData.roleId,
                    password: formData.password || undefined
                });
            } else {
                await userService.create(formData);
            }
            loadData();
            closeModal();
            setShowSaveConfirm(false);
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            email: user.email,
            fullName: user.fullName,
            roleId: user.roleId
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
            await userService.delete(deleteTargetId);
            loadData();
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    }


    const handleToggleActive = async (user: User) => {
        try {
            await userService.update(user.id, { ...user, isActive: !user.isActive });
            loadData();
        } catch (error) {
            console.error('Durum güncelleme hatası:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', email: '', fullName: '', roleId: 2 });
    };

    const columns: Column<User>[] = [
        {
            header: 'Ad Soyad',
            render: (user) => (
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {user.fullName}
                </span>
            )
        },
        { header: 'Kullanıcı Adı', accessor: 'username' },
        { header: 'E-posta', accessor: 'email' },
        {
            header: 'Rol',
            render: (user) => (
                <span className={`badge ${user.roleName === 'Admin' ? 'badge-primary' : 'badge-neutral'}`}>
                    {user.roleName}
                </span>
            )
        },
        {
            header: 'Durum',
            render: (user) => (
                <span
                    className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleToggleActive(user)}
                    title={user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                >
                    {user.isActive ? 'Aktif' : 'Pasif'}
                </span>
            )
        },
        {
            header: 'Kayıt Tarihi',
            render: (user) => new Date(user.createdAt).toLocaleDateString('tr-TR')
        },
        {
            header: 'İşlemler',
            render: (user) => (
                <div className="flex gap-sm">
                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={() => handleEdit(user)}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        className="btn btn-icon btn-danger"
                        onClick={() => handleDelete(user.id)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <div className="page-content">
                <DataTable
                    title="Kullanıcılar"
                    columns={columns}
                    data={stableTableData}
                    searchable={true}
                    onSearch={setSearchTerm}
                    searchPlaceholder="Kullanıcı ara..."
                    onAdd={() => setShowModal(true)}
                    addButtonLabel="Kullanıcı Ekle"
                    emptyMessage="Kullanıcı bulunamadı."
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUser ? 'Kullanıcı Düzenle' : 'Kullanıcı Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ad Soyad *"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                {!editingUser && (
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Kullanıcı Adı *"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="E-posta *"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder={editingUser ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre *'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="form-group">
                                    <select
                                        className="form-select"
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                                        required
                                    >
                                        <option value="" disabled>Rol Seçiniz *</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={18} />
                                    <span>{editingUser ? 'Güncelle' : 'Kaydet'}</span>
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
                message={editingUser ? 'Bu kullanıcıyı güncellemek istediğinize emin misiniz?' : 'Yeni kullanıcı eklemek istediğinize emin misiniz?'}
                confirmText={editingUser ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu kullanıcıyı silmek istediğinize emin misiniz?"
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="info"
            />
        </>
    );
}
