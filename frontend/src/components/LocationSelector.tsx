import { useState, useEffect } from 'react';
import { Location } from '../types';
import { ChevronRight } from 'lucide-react';

interface LocationSelectorProps {
    locations: Location[];
    selectedParentId: number | null;
    onChange: (parentId: number | null) => void;
}

export default function LocationSelector({ locations, selectedParentId, onChange }: LocationSelectorProps) {
    const [selectionPath, setSelectionPath] = useState<number[]>([]);

    useEffect(() => {
        if (!selectedParentId) {
            setSelectionPath([]);
            return;
        }

        const path = findPath(locations, selectedParentId);
        if (path) {
            setSelectionPath(path);
        }
    }, [selectedParentId, locations]);

    const findPath = (nodes: Location[], targetId: number, currentPath: number[] = []): number[] | null => {
        for (const node of nodes) {
            if (node.id === targetId) {
                return [...currentPath, node.id];
            }
            if (node.subLocations && node.subLocations.length > 0) {
                const found = findPath(node.subLocations, targetId, [...currentPath, node.id]);
                if (found) return found;
            }
        }
        return null;
    };

    const handleSelectChange = (level: number, value: string) => {
        const newId = value === '' ? null : parseInt(value);
        let newPath = [...selectionPath];

        if (newId === null) {
            newPath = newPath.slice(0, level);
            const parentId = level === 0 ? null : newPath[level - 1];
            setSelectionPath(newPath);
            onChange(parentId);
        } else {
            newPath = newPath.slice(0, level);
            newPath.push(newId);
            setSelectionPath(newPath);
            onChange(newId);
        }
    };

    const findLocationName = (nodes: Location[], id: number): string => {
        for (const node of nodes) {
            if (node.id === id) return node.name;
            if (node.subLocations) {
                const found = findLocationName(node.subLocations, id);
                if (found) return found;
            }
        }
        return '';
    };

    const renderDropdowns = () => {
        const dropdowns = [];
        let currentLevelLocations = locations;
        const depth = selectionPath.length + 1;

        for (let i = 0; i < depth; i++) {
            const level = i;
            const selectedId = selectionPath[level] || '';

            dropdowns.push(
                <div key={level} className="flex items-center gap-sm mb-sm animate-fade-in">
                    {level > 0 && <ChevronRight className="text-muted" size={16} />}
                    <select
                        className="form-select flex-1"
                        value={selectedId || ''}
                        onChange={(e) => handleSelectChange(level, e.target.value)}
                    >
                        <option value="">
                            {level === 0
                                ? '➕ Ana Bölüm Olarak Ekle'
                                : `➕ ${findLocationName(locations, selectionPath[level - 1])} Altına Ekle`}
                        </option>

                        {currentLevelLocations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                                {getLocationIconEmoji(loc.type)} {loc.name}
                            </option>
                        ))}
                    </select>
                </div>
            );

            if (selectedId) {
                const selectedLoc = currentLevelLocations.find(l => l.id === selectedId);
                if (selectedLoc && selectedLoc.subLocations) {
                    currentLevelLocations = selectedLoc.subLocations;
                } else {
                    currentLevelLocations = [];
                    if (!selectedLoc?.subLocations) currentLevelLocations = [];
                }
            } else {
                break;
            }
        }
        return dropdowns;
    };

    const getLocationIconEmoji = (type: string) => {
        switch (type) {
            case 'Bina': return '🏢';
            case 'Kat': return '≡';
            case 'Koridor': return '🛣️';
            case 'Oda': return '🚪';
            case 'Depo': return '📦';
            default: return '📍';
        }
    }

    return (
        <div className="location-selector">
            <label className="form-label block mb-sm text-sm font-medium text-gray-700">Konum</label>
            <div className="bg-gray-50 p-sm rounded border border-gray-200">
                {renderDropdowns()}
            </div>
            <div className="text-xs text-muted mt-xs">
                {selectedParentId
                    ? `Seçili Üst Bölüm: ${findLocationName(locations, selectedParentId)}`
                    : 'Seçili Konum: Ana Bölüm'}
            </div>
        </div>
    );
}
