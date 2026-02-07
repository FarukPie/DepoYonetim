import { useState, useEffect } from 'react';
import { Category } from '../types';
import { ChevronRight } from 'lucide-react';

interface CategorySelectorProps {
    categories: Category[];
    selectedParentId: number | null;
    onChange: (parentId: number | null) => void;
}

export default function CategorySelector({ categories, selectedParentId, onChange }: CategorySelectorProps) {
    // Path of selected category IDs (e.g. [1, 5, 8])
    const [selectionPath, setSelectionPath] = useState<number[]>([]);

    // Initialize path based on selectedParentId when component mounts or changes
    useEffect(() => {
        if (!selectedParentId) {
            setSelectionPath([]);
            return;
        }

        const path = findPath(categories, selectedParentId);
        if (path) {
            setSelectionPath(path);
        }
    }, [selectedParentId, categories]);

    // Helper to find path to a category ID
    const findPath = (nodes: Category[], targetId: number, currentPath: number[] = []): number[] | null => {
        for (const node of nodes) {
            if (node.id === targetId) {
                return [...currentPath, node.id];
            }
            if (node.subCategories && node.subCategories.length > 0) {
                const found = findPath(node.subCategories, targetId, [...currentPath, node.id]);
                if (found) return found;
            }
        }
        return null;
    };

    const handleSelectChange = (level: number, value: string) => {
        const newId = value === '' ? null : parseInt(value);

        let newPath = [...selectionPath];

        if (newId === null) {
            // "Add Here" selected. 
            // The effective parent is the ID of the PREVIOUS level (if any).
            // Example: Root -> Electronics -> [Add Here]. Parent is Electronics.
            newPath = newPath.slice(0, level); // Trim path to this level

            const parentId = level === 0 ? null : newPath[level - 1];
            setSelectionPath(newPath); // Visual update
            onChange(parentId); // Logic update
        } else {
            // A category selected. 
            // We are navigating deeper.
            // Example: Root -> [Electronics]. Path becomes [Electronics].
            // But wait, if they select "Electronics", do they mean "Add under Electronics" or "Use Electronics as Parent"?
            // In a cascading creating flow:
            // "Electronics" -> Show next dropdown. Default next dropdown value is "Add Here".
            // So if I select "Electronics", I am technically selecting it as a *potential* parent, 
            // but the *actual* parent for the new item isn't finalized until I stop.
            // Actually, if I select "Electronics", the implied parent for the NEW item is Electronics,
            // UNTIL I select something in the NEXT dropdown.

            newPath = newPath.slice(0, level); // Remove deeper levels
            newPath.push(newId);
            setSelectionPath(newPath);
            onChange(newId); // Set current selection as parent
        }
    };

    // Render dropdowns
    const renderDropdowns = () => {
        const dropdowns = [];
        // Level 0 (Root)
        let currentLevelCategories = categories;

        // Loop through levels based on selection path + 1 for the next available selection
        // We always show one "more" dropdown than the path length, to allow drilling down
        // UNLESS the last selected item has no children? No, user allows adding new children.

        const depth = selectionPath.length + 1;

        for (let i = 0; i < depth; i++) {
            const level = i;

            // Current selection for this level
            const selectedId = selectionPath[level] || ''; // If path[level] exists, it's the selected value. Else empty.

            dropdowns.push(
                <div key={level} className="flex items-center gap-sm mb-sm animate-fade-in">
                    {level > 0 && <ChevronRight className="text-muted" size={16} />}
                    <select
                        className="form-select flex-1"
                        value={selectedId || ''}
                        onChange={(e) => handleSelectChange(level, e.target.value)}
                    >
                        {/* The Default "Add Here" Option */}
                        <option value="">
                            {level === 0
                                ? '➕ Ana Kategori Olarak Ekle'
                                : `➕ ${findCategoryName(categories, selectionPath[level - 1])} Altına Ekle`}
                        </option>

                        {/* List Categories at this level */}
                        {currentLevelCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                📁 {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            );

            // Prepare categories for next loop iteration
            if (selectedId) {
                const selectedCat = currentLevelCategories.find(c => c.id === selectedId);
                if (selectedCat && selectedCat.subCategories) {
                    currentLevelCategories = selectedCat.subCategories;
                } else {
                    currentLevelCategories = []; // Should not happen given logic, but safe guard
                    // Actually if no subcategories, we still render the next dropdown? 
                    // No, if no subcategories, the user can still create one. 
                    // So we need to provide an EMPTY list? 
                    // If list is empty, the dropdown will only have "Add Here". This is correct.
                    if (!selectedCat?.subCategories) currentLevelCategories = [];
                }
            } else {
                // If "Add Here" (empty value) is selected at this level, break the loop.
                // We don't show further dropdowns.
                break;
            }
        }
        return dropdowns;
    };

    const findCategoryName = (nodes: Category[], id: number): string => {
        for (const node of nodes) {
            if (node.id === id) return node.name;
            if (node.subCategories) {
                const found = findCategoryName(node.subCategories, id);
                if (found) return found;
            }
        }
        return '';
    };

    return (
        <div className="category-selector">
            <label className="form-label block mb-sm text-sm font-medium text-gray-700">Kategori Konumu</label>
            <div className="bg-gray-50 p-sm rounded border border-gray-200">
                {renderDropdowns()}
            </div>
            <div className="text-xs text-muted mt-xs">
                {selectedParentId
                    ? `Seçili Üst Kategori: ${findCategoryName(categories, selectedParentId)}`
                    : 'Seçili Konum: Ana Kategori (En Üst Düzey)'}
            </div>
        </div>
    );
}
