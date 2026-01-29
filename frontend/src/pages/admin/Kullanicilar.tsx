import { useEffect, useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react';
import { userService, roleService } from '../../services/api';
import { User, Role, UserCreate } from '../../types';

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

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
            try {
                await userService.delete(id);
                loadData();
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Silme sırasında bir hata oluştu.');
            }
        }
    };

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

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>
                        <Users size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                        Kullanıcı Yönetimi
                    </h1>
                    <p>Sistem kullanıcılarını yönetin</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    <span>Yeni Kullanıcı</span>
                </button>
            </header>

            <div className="page-content">
                {/* Search */}
                <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ position: 'relative' }}>
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
                            placeholder="Kullanıcı ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ad Soyad</th>
                                    <th>Kullanıcı Adı</th>
                                    <th>E-posta</th>
                                    <th>Rol</th>
                                    <th>Durum</th>
                                    <th>Kayıt Tarihi</th>
                                    <th style={{ textAlign: 'right' }}>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {user.fullName}
                                        </td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${user.roleName === 'Admin' ? 'badge-primary' : 'badge-neutral'}`}>
                                                {user.roleName}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleToggleActive(user)}
                                                title={user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                                            >
                                                {user.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-xs)' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => handleEdit(user)}
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Sil"
                                                    style={{ color: 'var(--accent-error)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
                            <button className="btn btn-outline" onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Ad Soyad *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                {!editingUser && (
                                    <div className="form-group">
                                        <label className="form-label">Kullanıcı Adı *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">E-posta *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        {editingUser ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Şifre *'}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Rol *</label>
                                    <select
                                        className="form-input"
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                                        required
                                    >
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
        </>
    );
}
