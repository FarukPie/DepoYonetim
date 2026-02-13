import { useState, useEffect, useMemo } from 'react';
import { Plus, X, ChevronRight, Check, FolderTree, Sparkles, CornerDownRight, Database } from 'lucide-react';
import { kategoriService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';
import CategoryItem from '../components/CategoryItem';
import ConfirmDialog from '../components/ConfirmDialog';

// Type for pending categories in the wizard
interface WizardCategory {
    tempId: string;
    ad: string;
    parentTempId: string | null; // null = root or existing DB parent
    parentDbId: number | null;   // If parent is an existing DB category
}

type WizardStep = 'selectParent' | 'name' | 'chooseAction';

export default function Kategoriler() {
    const { hasEntityPermission } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // ===== WIZARD STATES =====
    const [wizardStep, setWizardStep] = useState<WizardStep>('selectParent');
    const [wizardCategories, setWizardCategories] = useState<WizardCategory[]>([]);
    const [currentParentTempId, setCurrentParentTempId] = useState<string | null>(null);
    const [currentParentDbId, setCurrentParentDbId] = useState<number | null>(null);
    const [currentName, setCurrentName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Edit mode form data
    const [editFormData, setEditFormData] = useState({ ad: '', aciklama: '', ustKategoriId: '' });

    // Confirmation dialog states
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const canAdd = hasEntityPermission('kategori', 'add');
    const canEdit = hasEntityPermission('kategori', 'edit');
    const canDelete = hasEntityPermission('kategori', 'delete');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const treeData = await kategoriService.getTree();
            setCategories(treeData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    // Flatten categories for selector and duplicate checking
    const flattenCategories = (cats: Category[], level = 0): { id: number; name: string; level: number }[] => {
        let result: { id: number; name: string; level: number }[] = [];
        for (const cat of cats) {
            result.push({ id: cat.id, name: cat.name, level });
            if (cat.subCategories) {
                result = result.concat(flattenCategories(cat.subCategories, level + 1));
            }
        }
        return result;
    };

    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

    // Get all category names for duplicate checking
    const allCategoryNames = useMemo(() => {
        const dbNames = flatCategories.map(c => c.name.toLowerCase());
        const wizardNames = wizardCategories.map(c => c.ad.toLowerCase());
        return [...dbNames, ...wizardNames];
    }, [flatCategories, wizardCategories]);

    // Check if current name is duplicate
    const isDuplicate = useMemo(() => {
        const trimmed = currentName.trim().toLowerCase();
        if (!trimmed) return false;
        return allCategoryNames.includes(trimmed);
    }, [currentName, allCategoryNames]);

    // Get DB category name by ID
    const getDbCategoryName = (id: number | null): string => {
        if (!id) return '';
        const found = flatCategories.find(c => c.id === id);
        return found?.name || '';
    };

    // Get wizard category name by tempId
    const getWizardCategoryName = (tempId: string | null): string => {
        if (!tempId) return '';
        const found = wizardCategories.find(c => c.tempId === tempId);
        return found?.ad || '';
    };

    // Get current parent name (either DB or wizard)
    const getCurrentParentName = (): string => {
        if (currentParentTempId) return getWizardCategoryName(currentParentTempId);
        if (currentParentDbId) return getDbCategoryName(currentParentDbId);
        return '';
    };

    // Build tree from wizard categories, grouped by their DB parent
    const buildWizardTree = () => {
        const getChildren = (parentTempId: string | null, parentDbId: number | null): WizardCategory[] => {
            return wizardCategories.filter(c =>
                c.parentTempId === parentTempId &&
                c.parentDbId === parentDbId
            );
        };

        const renderNode = (cat: WizardCategory, depth: number): React.ReactNode => {
            const children = getChildren(cat.tempId, null); // Children of wizard categories have null parentDbId
            const isSelected = currentParentTempId === cat.tempId && !currentParentDbId;

            return (
                <div key={cat.tempId}>
                    <div
                        onClick={() => {
                            setCurrentParentTempId(cat.tempId);
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
                            📁 {cat.ad}
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

        // Group wizard categories by their DB parent
        const dbParentIds = [...new Set(wizardCategories.filter(c => c.parentDbId).map(c => c.parentDbId))];
        const rootWizardCats = getChildren(null, null);

        return (
            <>
                {/* Root wizard categories (no parent) */}
                {rootWizardCats.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                            🆕 Yeni Ana Kategoriler
                        </div>
                        {rootWizardCats.map(cat => renderNode(cat, 0))}
                    </div>
                )}

                {/* Wizard categories under existing DB categories */}
                {dbParentIds.map(dbId => {
                    if (!dbId) return null;
                    const dbParentName = getDbCategoryName(dbId);
                    const children = getChildren(null, dbId);

                    return (
                        <div key={`db-${dbId}`} style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                                📂 {dbParentName} altına eklenecek
                            </div>
                            {children.map(cat => renderNode(cat, 0))}
                        </div>
                    );
                })}
            </>
        );
    };

    // ===== WIZARD FUNCTIONS =====
    const openAddModal = () => {
        setEditingCategory(null);
        setWizardStep('selectParent');
        setWizardCategories([]);
        setCurrentParentTempId(null);
        setCurrentParentDbId(null);
        setCurrentName('');
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setWizardCategories([]);

        kategoriService.getAll().then(all => {
            const fullMatch = all.find((k: any) => k.id === category.id);
            if (fullMatch) {
                setEditFormData({
                    ad: fullMatch.ad,
                    aciklama: fullMatch.aciklama || '',
                    ustKategoriId: fullMatch.ustKategoriId?.toString() || ''
                });
            }
        });

        setShowModal(true);
    };

    // Select where to add (existing DB category or new root)
    const handleSelectParent = (dbId: number | null) => {
        setCurrentParentDbId(dbId);
        setCurrentParentTempId(null);
        setWizardStep('name');
    };

    // Add current name to the wizard tree
    const handleAddCategory = () => {
        if (!currentName.trim()) return;
        if (isDuplicate) return;

        const newCategory: WizardCategory = {
            tempId: `temp-${Date.now()}`,
            ad: currentName.trim(),
            parentTempId: currentParentTempId,
            parentDbId: currentParentTempId ? null : currentParentDbId // Only set DB parent if no wizard parent
        };

        setWizardCategories(prev => [...prev, newCategory]);
        setCurrentName('');
        setWizardStep('chooseAction');
    };

    // User wants to add another subcategory to current parent (sibling)
    const handleAddSibling = () => {
        // Keep current parent the same
        setWizardStep('name');
    };

    // User wants to add subcategory to the last added category
    const handleAddChild = () => {
        const lastAdded = wizardCategories[wizardCategories.length - 1];
        if (lastAdded) {
            setCurrentParentTempId(lastAdded.tempId);
            setCurrentParentDbId(null);
        }
        setWizardStep('name');
    };

    // User wants to add to a different existing category
    const handleAddToExisting = () => {
        setCurrentParentTempId(null);
        setCurrentParentDbId(null);
        setWizardStep('selectParent');
    };

    const handleSaveWizardClick = () => {
        if (wizardCategories.length === 0) return;
        setShowSaveConfirm(true);
    };

    // Save all categories to DB
    const handleSaveAll = async () => {
        if (wizardCategories.length === 0) return;

        setIsSaving(true);

        try {
            const tempToRealId: Record<string, number> = {};

            // Sort by depth (parents first)
            const getDepth = (cat: WizardCategory): number => {
                let depth = 0;
                let current = cat.parentTempId;
                while (current) {
                    depth++;
                    const parent = wizardCategories.find(c => c.tempId === current);
                    current = parent?.parentTempId || null;
                }
                return depth;
            };

            const sorted = [...wizardCategories].sort((a, b) => getDepth(a) - getDepth(b));

            for (const cat of sorted) {
                let parentId: number | null = null;

                if (cat.parentTempId) {
                    // Parent is another wizard category
                    parentId = tempToRealId[cat.parentTempId] || null;
                } else if (cat.parentDbId) {
                    // Parent is an existing DB category
                    parentId = cat.parentDbId;
                }

                const result = await kategoriService.create({
                    ad: cat.ad,
                    ustKategoriId: parentId
                });

                if (result && result.id) {
                    tempToRealId[cat.tempId] = result.id;
                }
            }

            loadCategories();
            setShowModal(false);
            setWizardCategories([]);
            setCurrentName('');
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

    const handleEditFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    // Handle edit form submit
    const handleEditSubmit = async () => {
        if (!editingCategory) return;

        try {
            await kategoriService.update(editingCategory.id, {
                ad: editFormData.ad,
                aciklama: editFormData.aciklama || undefined,
                ustKategoriId: editFormData.ustKategoriId ? parseInt(editFormData.ustKategoriId) : null,
            });
            loadCategories();
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
            await kategoriService.delete(deleteTargetId);
            loadCategories();
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
        }
    };

    const closeModal = () => {
        if (wizardCategories.length > 0 && !isSaving) {
            if (!confirm('Kaydedilmemiş kategoriler var. Çıkmak istediğinize emin misiniz?')) {
                return;
            }
        }
        setShowModal(false);
        setWizardCategories([]);
        setCurrentName('');
        setCurrentParentTempId(null);
        setCurrentParentDbId(null);
        setWizardStep('selectParent');
    };

    // ===== RENDER WIZARD CONTENT =====
    const renderWizardContent = () => {
        // Tree Preview Component
        const TreePreview = () => {
            if (wizardCategories.length === 0) return null;

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
                        Eklenecek: {wizardCategories.length}
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
                        <div>Nereye kategori eklemek istiyorsunuz?</div>
                    </div>

                    {/* New root category option */}
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
                        🏠 Yeni Ana Kategori Oluştur
                    </button>

                    {/* Existing categories */}
                    {flatCategories.length > 0 && (
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
                                Mevcut Kategorilere Ekle
                            </div>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {flatCategories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleSelectParent(cat.id)}
                                        style={{
                                            padding: '8px 10px',
                                            paddingLeft: `${10 + cat.level * 16}px`,
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
                                        {cat.level > 0 && <CornerDownRight size={12} style={{ color: 'var(--text-muted)' }} />}
                                        <span style={{ fontSize: '0.85rem' }}>📁 {cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save button if there are pending categories */}
                    {wizardCategories.length > 0 && (
                        <button
                            type="button"
                            className="btn btn-success"
                            style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                            onClick={handleSaveWizardClick}
                            disabled={isSaving}
                        >
                            {isSaving ? '⏳ Kaydediliyor...' : `✅ Kaydet (${wizardCategories.length})`}
                        </button>
                    )}
                </>
            );
        }

        // Step: Enter category name
        if (wizardStep === 'name') {
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

                    <div className="form-group">
                        <label className="form-label">
                            {isNewRoot ? 'Ana Kategori Adı' : 'Alt Kategori Adı'}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={currentName}
                            placeholder={isNewRoot ? 'Örn: Elektronik, Mobilya...' : `${parentName} altına...`}
                            autoFocus
                            style={isDuplicate ? { borderColor: 'var(--danger-500)' } : {}}
                            onChange={(e) => setCurrentName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && currentName.trim() && !isDuplicate) {
                                    e.preventDefault();
                                    handleAddCategory();
                                }
                            }}
                        />
                        {isDuplicate && (
                            <div style={{ color: 'var(--danger-500)', fontSize: '0.8rem', marginTop: '4px' }}>
                                ⚠️ Bu isim zaten mevcut!
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={handleAddCategory}
                            disabled={!currentName.trim() || isDuplicate}
                        >
                            <Check size={16} /> Ekle
                        </button>

                        {wizardCategories.length > 0 && (
                            <button
                                type="button"
                                className="btn btn-success"
                                style={{ flex: 1 }}
                                onClick={handleSaveWizardClick}
                                disabled={isSaving}
                            >
                                {isSaving ? '⏳' : `✅ Kaydet (${wizardCategories.length})`}
                            </button>
                        )}
                    </div>
                </>
            );
        }

        // Step: Choose what to do next
        if (wizardStep === 'chooseAction') {
            const lastAdded = wizardCategories[wizardCategories.length - 1];
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
                                📂 "{lastAddedName}" altına alt kategori ekle
                            </button>

                            {hasParent && (
                                <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={handleAddSibling}>
                                    📁 "{parentName}" altına kardeş ekle
                                </button>
                            )}

                            <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={handleAddToExisting}>
                                🔍 Farklı bir kategoriye ekle
                            </button>

                            <button
                                type="button"
                                className="btn btn-success"
                                style={{ width: '100%', marginTop: 'var(--spacing-xs)' }}
                                onClick={handleSaveWizardClick}
                                disabled={isSaving}
                            >
                                {isSaving ? '⏳ Kaydediliyor...' : `✅ Tamamla (${wizardCategories.length})`}
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
        <form onSubmit={handleEditFormSubmit}>
            <div className="modal-body">
                <div className="form-group">
                    <label className="form-label">Kategori Adı</label>
                    <input type="text" className="form-input" value={editFormData.ad}
                        onChange={(e) => setEditFormData({ ...editFormData, ad: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label className="form-label">Üst Kategori</label>
                    <select className="form-select" value={editFormData.ustKategoriId}
                        onChange={(e) => setEditFormData({ ...editFormData, ustKategoriId: e.target.value })}>
                        <option value="">-- Ana Kategori --</option>
                        {flatCategories.filter(cat => cat.id !== editingCategory?.id).map(cat => (
                            <option key={cat.id} value={cat.id}>{'  '.repeat(cat.level)}{cat.name}</option>
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
                            <Plus size={18} /> Kategori Ekle
                        </button>
                    </div>
                )}

                <div className="category-tree">
                    {categories.length === 0 && <div className="text-muted p-md">Hiç kategori bulunamadı.</div>}
                    {categories.map((category) => (
                        <CategoryItem
                            key={category.id}
                            category={category}
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
                            <h2>{editingCategory ? 'Kategori Düzenle' : '🗂️ Kategori Ekle'}</h2>
                            <button className="modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        {editingCategory ? renderEditForm() : <div className="modal-body">{renderWizardContent()}</div>}
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Silme Onayı"
                message="Bu kategoriyi silmek istediğinize emin misiniz? Alt kategoriler de silinebilir."
                confirmText="Sil"
                cancelText="İptal"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                variant="info"
            />

            <ConfirmDialog
                isOpen={showSaveConfirm}
                title="Kaydetme Onayı"
                message={editingCategory ? 'Bu kategoriyi güncellemek istediğinize emin misiniz?' : `Eklenen ${wizardCategories.length} kategoriyi kaydetmek istediğinize emin misiniz?`}
                confirmText={editingCategory ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
                onConfirm={() => {
                    setShowSaveConfirm(false);
                    if (editingCategory) {
                        handleEditSubmit();
                    } else {
                        handleSaveAll();
                    }
                }}
                onCancel={() => setShowSaveConfirm(false)}
                variant="info"
            />
        </>
    );
}
