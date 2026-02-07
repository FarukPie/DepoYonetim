import { useState, useEffect, useMemo } from 'react';
import { Plus, X, Trash2, FolderPlus, ChevronRight, AlertCircle } from 'lucide-react';
import { bolumService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Location as AppLocation, LocationType } from '../types';
import LocationItem from '../components/LocationItem';
import ConfirmDialog from '../components/ConfirmDialog';

// Type for pending locations (not yet saved to DB)
interface PendingLocation {
    tempId: string;
    ad: string;
    kod: string;
    aciklama: string;
    tip: LocationType;
    ustBolumId: number | null; // Real DB parent ID
    pendingParentId: string | null; // Reference to another pending location
    ustBolumAd?: string;
    level: number;
}

export default function Bolumler() {
    const { hasEntityPermission } = useAuth();
    const [locations, setLocations] = useState<AppLocation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState<AppLocation | null>(null);
    const [formData, setFormData] = useState({
        ad: '',
        kod: '',
        aciklama: '',
        ustBolumId: '',
        pendingParentId: '',
        tip: 'Oda' as LocationType
    });

    // Batch add states
    const [pendingLocations, setPendingLocations] = useState<PendingLocation[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // Suggestion/autocomplete state
    const [showSuggestions, setShowSuggestions] = useState(false);

    const canAdd = hasEntityPermission('bolum', 'add');
    const canEdit = hasEntityPermission('bolum', 'edit');
    const canDelete = hasEntityPermission('bolum', 'delete');

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const treeData = await bolumService.getTree();
            setLocations(treeData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    // Flatten locations for selector
    const flattenLocations = (locs: AppLocation[], level = 0): { id: number; name: string; type: string; level: number }[] => {
        let result: { id: number; name: string; type: string; level: number }[] = [];
        for (const loc of locs) {
            result.push({ id: loc.id, name: loc.name, type: loc.type, level });
            if (loc.subLocations) {
                result = result.concat(flattenLocations(loc.subLocations, level + 1));
            }
        }
        return result;
    };

    // Get all location names for duplicate checking
    const allLocationNames = useMemo(() => {
        const flat = flattenLocations(locations);
        return flat.map(l => l.name.toLowerCase());
    }, [locations]);

    // Check if location name already exists
    const isDuplicate = useMemo(() => {
        const trimmed = formData.ad.trim().toLowerCase();
        if (!trimmed) return false;
        const existsInDB = allLocationNames.includes(trimmed);
        const existsInPending = pendingLocations.some(p => p.ad.toLowerCase() === trimmed);
        return existsInDB || existsInPending;
    }, [formData.ad, allLocationNames, pendingLocations]);

    // Get matching suggestions
    const suggestions = useMemo(() => {
        const trimmed = formData.ad.trim().toLowerCase();
        if (!trimmed || trimmed.length < 1) return [];
        const flat = flattenLocations(locations);
        return flat.filter(l => l.name.toLowerCase().includes(trimmed)).slice(0, 5);
    }, [formData.ad, locations]);

    // Get location name by ID
    const getLocationName = (id: number | null): string => {
        if (!id) return '';
        const flat = flattenLocations(locations);
        const found = flat.find(l => l.id === id);
        return found?.name || '';
    };

    // Get pending location name
    const getPendingLocationName = (tempId: string | null): string => {
        if (!tempId) return '';
        const found = pendingLocations.find(p => p.tempId === tempId);
        return found?.ad || '';
    };

    // Calculate level for a new pending location
    const calculateLevel = (ustBolumId: number | null, pendingParentId: string | null): number => {
        if (pendingParentId) {
            const parent = pendingLocations.find(p => p.tempId === pendingParentId);
            return parent ? parent.level + 1 : 0;
        }
        if (ustBolumId) {
            return 1;
        }
        return 0;
    };

    // Get type icon
    const getTypeIcon = (tip: LocationType): string => {
        switch (tip) {
            case 'Bina': return '🏢';
            case 'Kat': return '≡';
            case 'Koridor': return '🛣️';
            case 'Oda': return '🚪';
            case 'Depo': return '📦';
            default: return '📍';
        }
    };

    const openAddModal = () => {
        setEditingLocation(null);
        setFormData({ ad: '', kod: '', aciklama: '', ustBolumId: '', pendingParentId: '', tip: 'Oda' });
        setPendingLocations([]);
        setShowModal(true);
    };

    const openEditModal = (location: AppLocation) => {
        setEditingLocation(location);
        setPendingLocations([]);

        bolumService.getById(location.id).then((fullMatch: any) => {
            if (fullMatch) {
                setFormData({
                    ad: fullMatch.name,
                    kod: fullMatch.code || '',
                    aciklama: fullMatch.description || '',
                    ustBolumId: fullMatch.parentId?.toString() || '',
                    pendingParentId: '',
                    tip: fullMatch.type as LocationType
                });
            }
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId === null) return;
        try {
            await bolumService.delete(deleteTargetId);
            loadLocations();
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    // Add location to pending list
    const addToPending = () => {
        if (!formData.ad.trim()) {
            alert('Bölüm adı boş olamaz.');
            return;
        }
        if (!formData.kod.trim()) {
            alert('Bölüm kodu boş olamaz.');
            return;
        }

        if (isDuplicate) {
            alert('Bu isimde bir bölüm zaten mevcut!');
            return;
        }

        const ustBolumId = formData.ustBolumId ? parseInt(formData.ustBolumId) : null;
        const pendingParentId = formData.pendingParentId || null;

        let parentName = '';
        if (pendingParentId) {
            parentName = getPendingLocationName(pendingParentId);
        } else if (ustBolumId) {
            parentName = getLocationName(ustBolumId);
        }

        const newPending: PendingLocation = {
            tempId: `temp-${Date.now()}-${Math.random()}`,
            ad: formData.ad.trim(),
            kod: formData.kod.trim(),
            aciklama: formData.aciklama.trim(),
            tip: formData.tip,
            ustBolumId: pendingParentId ? null : ustBolumId,
            pendingParentId: pendingParentId,
            ustBolumAd: parentName,
            level: calculateLevel(ustBolumId, pendingParentId)
        };

        setPendingLocations(prev => [...prev, newPending]);
        setFormData({
            ad: '',
            kod: '',
            aciklama: '',
            ustBolumId: formData.ustBolumId,
            pendingParentId: formData.pendingParentId,
            tip: formData.tip
        });
    };

    // Remove from pending list (and all children)
    const removeFromPending = (tempId: string) => {
        const findChildren = (parentId: string): string[] => {
            const children = pendingLocations.filter(p => p.pendingParentId === parentId);
            let allChildren = children.map(c => c.tempId);
            for (const child of children) {
                allChildren = allChildren.concat(findChildren(child.tempId));
            }
            return allChildren;
        };

        const toRemove = new Set([tempId, ...findChildren(tempId)]);
        setPendingLocations(prev => prev.filter(p => !toRemove.has(p.tempId)));
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingLocation) {
            setShowSaveConfirm(true);
        } else {
            addToPending();
        }
    };

    // Save single location (edit mode)
    const confirmSave = async () => {
        if (!editingLocation) return;

        const data = {
            ad: formData.ad,
            kod: formData.kod,
            aciklama: formData.aciklama || undefined,
            ustBolumId: formData.ustBolumId ? parseInt(formData.ustBolumId) : null,
            tip: formData.tip
        };

        try {
            await bolumService.update(editingLocation.id, data);
            loadLocations();
            setShowModal(false);
            setFormData({ ad: '', kod: '', aciklama: '', ustBolumId: '', pendingParentId: '', tip: 'Oda' });
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        } finally {
            setShowSaveConfirm(false);
        }
    };

    // Save all pending locations in correct order
    const saveAllPending = async () => {
        if (pendingLocations.length === 0) {
            alert('Kaydedilecek bölüm bulunmuyor.');
            return;
        }

        setIsSaving(true);

        const tempToRealId: Record<string, number> = {};
        let successCount = 0;
        let errorCount = 0;

        // Sort by level to ensure parents are saved before children
        const sorted = [...pendingLocations].sort((a, b) => a.level - b.level);

        try {
            for (const pending of sorted) {
                try {
                    let realParentId: number | null = pending.ustBolumId;

                    if (pending.pendingParentId) {
                        realParentId = tempToRealId[pending.pendingParentId] || null;
                    }

                    const result = await bolumService.create({
                        ad: pending.ad,
                        kod: pending.kod,
                        aciklama: pending.aciklama || undefined,
                        ustBolumId: realParentId,
                        tip: pending.tip
                    });

                    if (result && result.id) {
                        tempToRealId[pending.tempId] = result.id;
                    }
                    successCount++;
                } catch (err) {
                    console.error('Bölüm kaydetme hatası:', pending.ad, err);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                loadLocations();
            }

            if (errorCount === 0) {
                setShowModal(false);
                setPendingLocations([]);
                setFormData({ ad: '', kod: '', aciklama: '', ustBolumId: '', pendingParentId: '', tip: 'Oda' });
            } else {
                alert(`${successCount} bölüm başarıyla kaydedildi. ${errorCount} bölüm kaydedilemedi.`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const closeModal = () => {
        if (pendingLocations.length > 0) {
            if (!confirm('Kaydedilmemiş bölümler var. Çıkmak istediğinize emin misiniz?')) {
                return;
            }
        }
        setShowModal(false);
        setPendingLocations([]);
        setFormData({ ad: '', kod: '', aciklama: '', ustBolumId: '', pendingParentId: '', tip: 'Oda' });
    };

    // Render the hierarchical pending list
    const renderPendingTree = () => {
        const renderItem = (pending: PendingLocation, depth: number = 0) => {
            const children = pendingLocations.filter(p => p.pendingParentId === pending.tempId);

            return (
                <div key={pending.tempId}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            paddingLeft: `calc(var(--spacing-md) + ${depth * 20}px)`,
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-secondary)',
                            marginBottom: 'var(--spacing-xs)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            {depth > 0 && <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
                            <span>{getTypeIcon(pending.tip)}</span>
                            <div>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {pending.ad} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({pending.kod})</span>
                                </div>
                                {pending.ustBolumAd && !pending.pendingParentId && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Üst: {pending.ustBolumAd}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-icon btn-danger"
                            style={{ padding: '4px' }}
                            onClick={() => removeFromPending(pending.tempId)}
                            title={children.length > 0 ? 'Alt bölümlerle birlikte sil' : 'Listeden Kaldır'}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                    {children.map(child => renderItem(child, depth + 1))}
                </div>
            );
        };

        const roots = pendingLocations.filter(p => !p.pendingParentId);
        return roots.map(root => renderItem(root, 0));
    };

    const flatLocations = flattenLocations(locations);

    return (
        <>
            <div className="page-content">
                {canAdd && (
                    <div className="toolbar">
                        <button className="btn btn-primary" onClick={openAddModal}>
                            <Plus size={18} /> Bölüm/Oda Ekle
                        </button>
                    </div>
                )}

                <div className="category-tree">
                    {locations.length === 0 && <div className="text-muted p-md">Hiç bölüm bulunamadı.</div>}
                    {locations.map((location) => (
                        <LocationItem
                            key={location.id}
                            location={location}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h2>{editingLocation ? 'Bölüm Düzenle' : 'Toplu Bölüm/Oda Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label className="form-label">Bölüm Adı</label>
                                        <input type="text" className="form-input" value={formData.ad}
                                            placeholder="Örn: 1. Kat, Oda 101"
                                            autoComplete="off"
                                            style={isDuplicate ? { borderColor: 'var(--danger-500)' } : {}}
                                            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />

                                        {/* Duplicate warning */}
                                        {isDuplicate && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                color: 'var(--danger-500)',
                                                fontSize: '0.75rem',
                                                marginTop: '4px'
                                            }}>
                                                <AlertCircle size={12} />
                                                Bu isimde bölüm mevcut!
                                            </div>
                                        )}

                                        {/* Suggestions dropdown */}
                                        {showSuggestions && suggestions.length > 0 && !editingLocation && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-primary)',
                                                borderRadius: 'var(--radius-md)',
                                                marginTop: '4px',
                                                zIndex: 100,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                maxHeight: '150px',
                                                overflowY: 'auto'
                                            }}>
                                                <div style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-secondary)' }}>
                                                    Tıklayarak altına alt bölüm ekle:
                                                </div>
                                                {suggestions.map(s => (
                                                    <div
                                                        key={s.id}
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                ad: '',
                                                                ustBolumId: s.id.toString(),
                                                                pendingParentId: ''
                                                            });
                                                            setShowSuggestions(false);
                                                        }}
                                                        style={{
                                                            padding: '8px 12px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            color: s.name.toLowerCase() === formData.ad.trim().toLowerCase()
                                                                ? 'var(--danger-500)'
                                                                : 'var(--text-primary)',
                                                            background: s.name.toLowerCase() === formData.ad.trim().toLowerCase()
                                                                ? 'var(--danger-100)'
                                                                : 'transparent',
                                                            borderBottom: '1px solid var(--border-secondary)',
                                                            transition: 'background 0.15s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (s.name.toLowerCase() !== formData.ad.trim().toLowerCase()) {
                                                                e.currentTarget.style.background = 'var(--bg-tertiary)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (s.name.toLowerCase() !== formData.ad.trim().toLowerCase()) {
                                                                e.currentTarget.style.background = 'transparent';
                                                            }
                                                        }}
                                                    >
                                                        {'  '.repeat(s.level)}{getTypeIcon(s.type as LocationType)} {s.name}
                                                        {s.name.toLowerCase() === formData.ad.trim().toLowerCase() ? (
                                                            <span style={{ marginLeft: '6px', fontWeight: 500 }}>← Mevcut</span>
                                                        ) : (
                                                            <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>→ alt bölüm ekle</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Bölüm Kodu</label>
                                        <input type="text" className="form-input" value={formData.kod}
                                            placeholder="Örn: K1, O101"
                                            onChange={(e) => setFormData({ ...formData, kod: e.target.value })} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Bölüm Tipi</label>
                                    <select className="form-select" value={formData.tip}
                                        onChange={(e) => setFormData({ ...formData, tip: e.target.value as LocationType })}>
                                        <option value="Bina">🏢 Bina</option>
                                        <option value="Kat">≡ Kat</option>
                                        <option value="Koridor">🛣️ Koridor</option>
                                        <option value="Oda">🚪 Oda</option>
                                        <option value="Depo">📦 Depo</option>
                                    </select>
                                </div>

                                {/* Parent selector - combined DB + pending */}
                                {!editingLocation && (
                                    <div className="form-group">
                                        <label className="form-label">Üst Bölüm</label>
                                        <select
                                            className="form-select"
                                            value={formData.pendingParentId ? `pending:${formData.pendingParentId}` : (formData.ustBolumId ? `db:${formData.ustBolumId}` : '')}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.startsWith('pending:')) {
                                                    setFormData({ ...formData, pendingParentId: val.replace('pending:', ''), ustBolumId: '' });
                                                } else if (val.startsWith('db:')) {
                                                    setFormData({ ...formData, ustBolumId: val.replace('db:', ''), pendingParentId: '' });
                                                } else {
                                                    setFormData({ ...formData, ustBolumId: '', pendingParentId: '' });
                                                }
                                            }}
                                        >
                                            <option value="">-- Ana Bölüm (Üst yok) --</option>

                                            {pendingLocations.length > 0 && (
                                                <optgroup label="📋 Yeni Eklenenler">
                                                    {pendingLocations.map(p => (
                                                        <option key={p.tempId} value={`pending:${p.tempId}`}>
                                                            {'  '.repeat(p.level)}↳ {getTypeIcon(p.tip)} {p.ad}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}

                                            {flatLocations.length > 0 && (
                                                <optgroup label="📁 Mevcut Bölümler">
                                                    {flatLocations.map(loc => (
                                                        <option key={loc.id} value={`db:${loc.id}`}>
                                                            {'  '.repeat(loc.level)}{loc.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {/* Edit mode - only DB locations */}
                                {editingLocation && (
                                    <div className="form-group">
                                        <label className="form-label">Üst Bölüm</label>
                                        <select
                                            className="form-select"
                                            value={formData.ustBolumId}
                                            onChange={(e) => setFormData({ ...formData, ustBolumId: e.target.value })}
                                        >
                                            <option value="">-- Ana Bölüm --</option>
                                            {flatLocations
                                                .filter(loc => loc.id !== editingLocation.id)
                                                .map(loc => (
                                                    <option key={loc.id} value={loc.id}>
                                                        {'  '.repeat(loc.level)}{loc.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-textarea" rows={2} value={formData.aciklama}
                                        placeholder="Açıklama (isteğe bağlı)"
                                        onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })} />
                                </div>

                                {/* Add to list button */}
                                {!editingLocation && (
                                    <button
                                        type="submit"
                                        className="btn btn-secondary"
                                        style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                                    >
                                        <FolderPlus size={16} style={{ marginRight: '6px' }} />
                                        Listeye Ekle
                                    </button>
                                )}

                                {/* Pending locations list */}
                                {!editingLocation && pendingLocations.length > 0 && (
                                    <div style={{
                                        marginTop: 'var(--spacing-md)',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-primary)',
                                        maxHeight: '220px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            marginBottom: 'var(--spacing-sm)',
                                            color: 'var(--text-primary)'
                                        }}>
                                            Eklenecek Bölümler ({pendingLocations.length})
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {renderPendingTree()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>İptal</button>
                                {editingLocation ? (
                                    <button type="submit" className="btn btn-primary">Güncelle</button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={saveAllPending}
                                        disabled={pendingLocations.length === 0 || isSaving}
                                    >
                                        {isSaving ? 'Kaydediliyor...' : `Tümünü Kaydet (${pendingLocations.length})`}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message="Bu bölümü güncellemek istediğinize emin misiniz?"
                confirmText="Güncelle"
                cancelText="İptal"
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu bölümü silmek istediğinize emin misiniz? Alt bölümler de silinebilir."
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="danger"
            />
        </>
    );
}
