import { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronRight, Check, FolderTree, Sparkles, CornerDownRight, Database } from 'lucide-react';
import { bolumService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Location as AppLocation, LocationType } from '../types';
import LocationItem from '../components/LocationItem';
import ConfirmDialog from '../components/ConfirmDialog';

// Type for pending locations in the wizard
interface WizardLocation {
    tempId: string;
    ad: string;
    kod: string;
    aciklama: string;
    tip: LocationType;
    parentTempId: string | null; // null = root or existing DB parent
    parentDbId: number | null;   // If parent is an existing DB location
}

type WizardStep = 'selectParent' | 'form' | 'chooseAction';

export default function Bolumler() {
    const { hasEntityPermission } = useAuth();
    const [locations, setLocations] = useState<AppLocation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState<AppLocation | null>(null);

    // ===== WIZARD STATES =====
    const [wizardStep, setWizardStep] = useState<WizardStep>('selectParent');
    const [wizardLocations, setWizardLocations] = useState<WizardLocation[]>([]);
    const [currentParentTempId, setCurrentParentTempId] = useState<string | null>(null);
    const [currentParentDbId, setCurrentParentDbId] = useState<number | null>(null);
    const [currentName, setCurrentName] = useState('');
    const [currentKod, setCurrentKod] = useState('');
    const [currentAciklama, setCurrentAciklama] = useState('');
    const [currentTip, setCurrentTip] = useState<LocationType>('Oda');
    const [isSaving, setIsSaving] = useState(false);

    // Edit mode form data
    const [editFormData, setEditFormData] = useState({ ad: '', kod: '', aciklama: '', ustBolumId: '', tip: 'Oda' as LocationType });

    // Confirmation dialog states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

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

    // Flatten locations for selector and duplicate checking
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

    const flatLocations = useMemo(() => flattenLocations(locations), [locations]);

    // Get all location names for duplicate checking
    const allLocationNames = useMemo(() => {
        const dbNames = flatLocations.map(l => l.name.toLowerCase());
        const wizardNames = wizardLocations.map(l => l.ad.toLowerCase());
        return [...dbNames, ...wizardNames];
    }, [flatLocations, wizardLocations]);

    // Check if current name is duplicate
    const isDuplicate = useMemo(() => {
        const trimmed = currentName.trim().toLowerCase();
        if (!trimmed) return false;
        return allLocationNames.includes(trimmed);
    }, [currentName, allLocationNames]);

    // Get DB location name by ID
    const getDbLocationName = (id: number | null): string => {
        if (!id) return '';
        const found = flatLocations.find(l => l.id === id);
        return found?.name || '';
    };

    // Get wizard location name by tempId
    const getWizardLocationName = (tempId: string | null): string => {
        if (!tempId) return '';
        const found = wizardLocations.find(l => l.tempId === tempId);
        return found?.ad || '';
    };

    // Get current parent name (either DB or wizard)
    const getCurrentParentName = (): string => {
        if (currentParentTempId) return getWizardLocationName(currentParentTempId);
        if (currentParentDbId) return getDbLocationName(currentParentDbId);
        return '';
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

    // Build tree from wizard locations, grouped by their DB parent
    const buildWizardTree = () => {
        const getChildren = (parentTempId: string | null, parentDbId: number | null): WizardLocation[] => {
            return wizardLocations.filter(l =>
                l.parentTempId === parentTempId &&
                l.parentDbId === parentDbId
            );
        };

        const renderNode = (loc: WizardLocation, depth: number): React.ReactNode => {
            const children = getChildren(loc.tempId, null);
            const isSelected = currentParentTempId === loc.tempId && !currentParentDbId;

            return (
                <div key={loc.tempId}>
                    <div
                        onClick={() => {
                            setCurrentParentTempId(loc.tempId);
                            setCurrentParentDbId(null);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 10px',
                            paddingLeft: `${10 + depth * 16}px`,
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                            transition: 'all 0.15s',
                            marginBottom: '2px'
                        }}
                    >
                        {depth > 0 && <CornerDownRight size={12} style={{ color: 'var(--text-muted)' }} />}
                        <span style={{
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? 'var(--primary-400)' : 'var(--text-primary)',
                            fontSize: '0.85rem'
                        }}>
                            {getTypeIcon(loc.tip)} {loc.ad}
                        </span>
                        {isSelected && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--primary-400)', marginLeft: 'auto' }}>
                                ← seçili
                            </span>
                        )}
                    </div>
                    {children.map(child => renderNode(child, depth + 1))}
                </div>
            );
        };

        // Group wizard locations by their DB parent
        const dbParentIds = [...new Set(wizardLocations.filter(l => l.parentDbId).map(l => l.parentDbId))];
        const rootWizardLocs = getChildren(null, null);

        return (
            <>
                {/* Root wizard locations (no parent) */}
                {rootWizardLocs.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                            🆕 Yeni Ana Bölümler
                        </div>
                        {rootWizardLocs.map(loc => renderNode(loc, 0))}
                    </div>
                )}

                {/* Wizard locations under existing DB locations */}
                {dbParentIds.map(dbId => {
                    if (!dbId) return null;
                    const dbParentName = getDbLocationName(dbId);
                    const children = getChildren(null, dbId);

                    return (
                        <div key={`db-${dbId}`} style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                                📂 {dbParentName} altına eklenecek
                            </div>
                            {children.map(loc => renderNode(loc, 0))}
                        </div>
                    );
                })}
            </>
        );
    };

    // ===== WIZARD FUNCTIONS =====
    const openAddModal = () => {
        setEditingLocation(null);
        setWizardStep('selectParent');
        setWizardLocations([]);
        setCurrentParentTempId(null);
        setCurrentParentDbId(null);
        setCurrentName('');
        setCurrentKod('');
        setCurrentAciklama('');
        setCurrentTip('Oda');
        setShowModal(true);
    };

    const openEditModal = (location: AppLocation) => {
        setEditingLocation(location);
        setWizardLocations([]);

        bolumService.getById(location.id).then((fullMatch: any) => {
            if (fullMatch) {
                setEditFormData({
                    ad: fullMatch.name,
                    kod: fullMatch.code || '',
                    aciklama: fullMatch.description || '',
                    ustBolumId: fullMatch.parentId?.toString() || '',
                    tip: fullMatch.type as LocationType
                });
            }
        });

        setShowModal(true);
    };

    // Select where to add (existing DB location or new root)
    const handleSelectParent = (dbId: number | null) => {
        setCurrentParentDbId(dbId);
        setCurrentParentTempId(null);
        setWizardStep('form');
    };

    // Add current location to the wizard tree
    const handleAddLocation = () => {
        if (!currentName.trim()) return;
        if (!currentKod.trim()) return;
        if (isDuplicate) return;

        const newLocation: WizardLocation = {
            tempId: `temp-${Date.now()}`,
            ad: currentName.trim(),
            kod: currentKod.trim(),
            aciklama: currentAciklama.trim(),
            tip: currentTip,
            parentTempId: currentParentTempId,
            parentDbId: currentParentTempId ? null : currentParentDbId
        };

        setWizardLocations(prev => [...prev, newLocation]);
        setCurrentName('');
        setCurrentKod('');
        setCurrentAciklama('');
        setWizardStep('chooseAction');
    };

    // User wants to add another sub-location to current parent (sibling)
    const handleAddSibling = () => {
        setWizardStep('form');
    };

    // User wants to add sub-location to the last added location
    const handleAddChild = () => {
        const lastAdded = wizardLocations[wizardLocations.length - 1];
        if (lastAdded) {
            setCurrentParentTempId(lastAdded.tempId);
            setCurrentParentDbId(null);
        }
        setWizardStep('form');
    };

    // User wants to add to a different existing location
    const handleAddToExisting = () => {
        setCurrentParentTempId(null);
        setCurrentParentDbId(null);
        setWizardStep('selectParent');
    };

    // Save all locations to DB
    const handleSaveAll = async () => {
        if (wizardLocations.length === 0) return;

        setIsSaving(true);

        try {
            const tempToRealId: Record<string, number> = {};

            // Sort by depth (parents first)
            const getDepth = (loc: WizardLocation): number => {
                let depth = 0;
                let current = loc.parentTempId;
                while (current) {
                    depth++;
                    const parent = wizardLocations.find(l => l.tempId === current);
                    current = parent?.parentTempId || null;
                }
                return depth;
            };

            const sorted = [...wizardLocations].sort((a, b) => getDepth(a) - getDepth(b));

            for (const loc of sorted) {
                let parentId: number | null = null;

                if (loc.parentTempId) {
                    parentId = tempToRealId[loc.parentTempId] || null;
                } else if (loc.parentDbId) {
                    parentId = loc.parentDbId;
                }

                const result = await bolumService.create({
                    ad: loc.ad,
                    kod: loc.kod,
                    aciklama: loc.aciklama || undefined,
                    ustBolumId: parentId,
                    tip: loc.tip
                });

                if (result && result.id) {
                    tempToRealId[loc.tempId] = result.id;
                }
            }

            loadLocations();
            setShowModal(false);
            setWizardLocations([]);
            setCurrentName('');
            setCurrentKod('');
            setCurrentAciklama('');
            setCurrentParentTempId(null);
            setCurrentParentDbId(null);
            setWizardStep('selectParent');
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle edit form submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLocation) return;

        try {
            await bolumService.update(editingLocation.id, {
                ad: editFormData.ad,
                kod: editFormData.kod,
                aciklama: editFormData.aciklama || undefined,
                ustBolumId: editFormData.ustBolumId ? parseInt(editFormData.ustBolumId) : null,
                tip: editFormData.tip
            });
            loadLocations();
            setShowModal(false);
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
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

    const closeModal = () => {
        if (wizardLocations.length > 0 && !isSaving) {
            if (!confirm('Kaydedilmemiş bölümler var. Çıkmak istediğinize emin misiniz?')) {
                return;
            }
        }
        setShowModal(false);
        setWizardLocations([]);
        setCurrentName('');
        setCurrentKod('');
        setCurrentAciklama('');
        setCurrentParentTempId(null);
        setCurrentParentDbId(null);
        setWizardStep('selectParent');
    };

    // ===== RENDER WIZARD CONTENT =====
    const renderWizardContent = () => {
        // Tree Preview Component
        const TreePreview = () => {
            if (wizardLocations.length === 0) return null;

            return (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        marginBottom: 'var(--spacing-xs)',
                        color: 'var(--primary-400)',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                    }}>
                        <FolderTree size={14} />
                        Eklenecek: {wizardLocations.length}
                    </div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {buildWizardTree()}
                    </div>
                </div>
            );
        };

        // Step: Select parent (new or existing)
        if (wizardStep === 'selectParent') {
            return (
                <>
                    <TreePreview />

                    <div style={{
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-md)',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        <Sparkles size={18} style={{ marginBottom: '6px', color: 'var(--primary-400)' }} />
                        <div>Nereye bölüm/oda eklemek istiyorsunuz?</div>
                    </div>

                    {/* New root location option */}
                    <button
                        type="button"
                        onClick={() => handleSelectParent(null)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            marginBottom: 'var(--spacing-sm)',
                            background: 'var(--bg-secondary)',
                            border: '2px solid var(--primary-400)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            color: 'var(--primary-400)',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}
                    >
                        🏠 Yeni Ana Bölüm Oluştur
                    </button>

                    {/* Existing locations */}
                    {flatLocations.length > 0 && (
                        <div style={{
                            marginTop: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm)',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-primary)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: 'var(--spacing-sm)',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                fontWeight: 600
                            }}>
                                <Database size={14} />
                                Mevcut Bölümlere Ekle
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {flatLocations.map(loc => (
                                    <div
                                        key={loc.id}
                                        onClick={() => handleSelectParent(loc.id)}
                                        style={{
                                            padding: '8px 10px',
                                            paddingLeft: `${10 + loc.level * 16}px`,
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-sm)',
                                            marginBottom: '2px',
                                            transition: 'background 0.15s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {loc.level > 0 && <CornerDownRight size={12} style={{ color: 'var(--text-muted)' }} />}
                                        <span style={{ fontSize: '0.85rem' }}>{getTypeIcon(loc.type as LocationType)} {loc.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save button if there are pending locations */}
                    {wizardLocations.length > 0 && (
                        <button
                            type="button"
                            className="btn btn-success"
                            style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                            onClick={handleSaveAll}
                            disabled={isSaving}
                        >
                            {isSaving ? '⏳ Kaydediliyor...' : `✅ Kaydet (${wizardLocations.length})`}
                        </button>
                    )}
                </>
            );
        }

        // Step: Enter location details
        if (wizardStep === 'form') {
            const parentName = getCurrentParentName();
            const isNewRoot = !currentParentTempId && !currentParentDbId;

            return (
                <>
                    <TreePreview />

                    {/* Context breadcrumb */}
                    {!isNewRoot && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: 'var(--spacing-md)',
                            padding: '8px 12px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)'
                        }}>
                            <span>📍</span>
                            <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{parentName}</span>
                            <span>altına ekleniyor</span>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">
                                {isNewRoot ? 'Ana Bölüm Adı' : 'Alt Bölüm Adı'}
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={currentName}
                                placeholder={isNewRoot ? 'Örn: A Blok, 1. Kat...' : `${parentName} altına...`}
                                autoFocus
                                style={isDuplicate ? { borderColor: 'var(--danger-500)' } : {}}
                                onChange={(e) => setCurrentName(e.target.value)}
                            />
                            {isDuplicate && (
                                <div style={{ color: 'var(--danger-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                                    ⚠️ Bu isim zaten mevcut!
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Bölüm Kodu</label>
                            <input
                                type="text"
                                className="form-input"
                                value={currentKod}
                                placeholder="Örn: K1, O101"
                                onChange={(e) => setCurrentKod(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bölüm Tipi</label>
                        <select
                            className="form-select"
                            value={currentTip}
                            onChange={(e) => setCurrentTip(e.target.value as LocationType)}
                        >
                            <option value="Bina">🏢 Bina</option>
                            <option value="Kat">≡ Kat</option>
                            <option value="Koridor">🛣️ Koridor</option>
                            <option value="Oda">🚪 Oda</option>
                            <option value="Depo">📦 Depo</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Açıklama</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            value={currentAciklama}
                            placeholder="Açıklama (isteğe bağlı)"
                            onChange={(e) => setCurrentAciklama(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={handleAddLocation}
                            disabled={!currentName.trim() || !currentKod.trim() || isDuplicate}
                        >
                            <Check size={16} /> Ekle
                        </button>

                        {wizardLocations.length > 0 && (
                            <button
                                type="button"
                                className="btn btn-success"
                                style={{ flex: 1 }}
                                onClick={handleSaveAll}
                                disabled={isSaving}
                            >
                                {isSaving ? '⏳' : `✅ Kaydet (${wizardLocations.length})`}
                            </button>
                        )}
                    </div>
                </>
            );
        }

        // Step: Choose what to do next
        if (wizardStep === 'chooseAction') {
            const lastAdded = wizardLocations[wizardLocations.length - 1];
            const lastAddedName = lastAdded?.ad || '';
            const parentName = getCurrentParentName();
            const hasParent = currentParentTempId || currentParentDbId;

            return (
                <>
                    <TreePreview />

                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-md)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-primary)'
                    }}>
                        <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                            ✅ <strong style={{ color: 'var(--primary-400)' }}>"{lastAddedName}"</strong> eklendi!
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddChild}>
                                📂 "{lastAddedName}" altına alt bölüm ekle
                            </button>

                            {hasParent && (
                                <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={handleAddSibling}>
                                    📁 "{parentName}" altına kardeş ekle
                                </button>
                            )}

                            <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={handleAddToExisting}>
                                🔍 Farklı bir bölüme ekle
                            </button>

                            <button
                                type="button"
                                className="btn btn-success"
                                style={{ width: '100%', marginTop: 'var(--spacing-xs)' }}
                                onClick={handleSaveAll}
                                disabled={isSaving}
                            >
                                {isSaving ? '⏳ Kaydediliyor...' : `✅ Tamamla (${wizardLocations.length})`}
                            </button>
                        </div>
                    </div>
                </>
            );
        }

        return null;
    };

    // ===== RENDER EDIT FORM =====
    const renderEditForm = () => (
        <form onSubmit={handleEditSubmit}>
            <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div className="form-group">
                        <label className="form-label">Bölüm Adı</label>
                        <input type="text" className="form-input" value={editFormData.ad}
                            onChange={(e) => setEditFormData({ ...editFormData, ad: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Bölüm Kodu</label>
                        <input type="text" className="form-input" value={editFormData.kod}
                            onChange={(e) => setEditFormData({ ...editFormData, kod: e.target.value })} required />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Bölüm Tipi</label>
                    <select className="form-select" value={editFormData.tip}
                        onChange={(e) => setEditFormData({ ...editFormData, tip: e.target.value as LocationType })}>
                        <option value="Bina">🏢 Bina</option>
                        <option value="Kat">≡ Kat</option>
                        <option value="Koridor">🛣️ Koridor</option>
                        <option value="Oda">🚪 Oda</option>
                        <option value="Depo">📦 Depo</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Üst Bölüm</label>
                    <select className="form-select" value={editFormData.ustBolumId}
                        onChange={(e) => setEditFormData({ ...editFormData, ustBolumId: e.target.value })}>
                        <option value="">-- Ana Bölüm --</option>
                        {flatLocations.filter(loc => loc.id !== editingLocation?.id).map(loc => (
                            <option key={loc.id} value={loc.id}>{'  '.repeat(loc.level)}{loc.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Açıklama</label>
                    <textarea className="form-textarea" rows={2} value={editFormData.aciklama}
                        placeholder="Açıklama (isteğe bağlı)"
                        onChange={(e) => setEditFormData({ ...editFormData, aciklama: e.target.value })} />
                </div>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>İptal</button>
                <button type="submit" className="btn btn-primary">Güncelle</button>
            </div>
        </form>
    );

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

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{editingLocation ? 'Bölüm Düzenle' : '🗂️ Bölüm/Oda Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        {editingLocation ? renderEditForm() : <div className="modal-body">{renderWizardContent()}</div>}
                    </div>
                </div>
            )}

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
