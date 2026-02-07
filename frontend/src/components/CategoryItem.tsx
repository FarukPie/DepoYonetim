import { useState } from 'react';
import { FolderTree, ChevronRight, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { Category } from '../types';

interface CategoryItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
    canEdit: boolean;
    canDelete: boolean;
    depth?: number;
}

export default function CategoryItem({ category, onEdit, onDelete, canEdit, canDelete, depth = 0 }: CategoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.subCategories && category.subCategories.length > 0;

    return (
        <div>
            <div className="category-item" style={{ marginLeft: `${depth * 28}px` }}>
                <div className="category-info">
                    <button
                        className="btn btn-icon btn-ghost btn-sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{ opacity: hasChildren ? 1 : 0, cursor: hasChildren ? 'pointer' : 'default' }}
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <div className="category-icon" style={{
                        color: depth === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                        background: 'none'
                    }}>
                        <FolderTree size={16} />
                    </div>

                    <div className="flex flex-col">
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{category.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {category.productCount} ürün
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => onEdit(category)}>
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => onDelete(category.id)}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="category-children">
                    {category.subCategories.map((child) => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
