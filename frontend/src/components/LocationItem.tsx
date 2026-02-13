import { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash2, Building, Layers, Route, DoorOpen, Warehouse, MapPin } from 'lucide-react';
import { Location } from '../types';

interface LocationItemProps {
    location: Location;
    onEdit: (location: Location) => void;
    onDelete: (id: number) => void;
    canEdit: boolean;
    canDelete: boolean;
    depth?: number;
}

export default function LocationItem({ location, onEdit, onDelete, canEdit, canDelete, depth = 0 }: LocationItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = location.subLocations && location.subLocations.length > 0;

    const getIcon = (type: string) => {
        switch (type) {
            case 'Bina': return <Building size={16} />;
            case 'Kat': return <Layers size={16} />;
            case 'Koridor': return <Route size={16} />;
            case 'Oda': return <DoorOpen size={16} />;
            case 'Depo': return <Warehouse size={16} />;
            default: return <MapPin size={16} />;
        }
    };



    return (
        <div>
            <div className="location-item category-item" style={{ marginLeft: `${depth * 28}px` }}>
                {/* Reusing category-item class for similar styling */}
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
                        {getIcon(location.type)}
                    </div>

                    <div className="flex flex-col">
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {location.name}

                        </div>
                        {location.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {location.description}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-sm">
                    {canEdit && (
                        <button className="btn btn-icon btn-secondary" onClick={() => onEdit(location)}>
                            <Edit size={16} />
                        </button>
                    )}
                    {canDelete && (
                        <button className="btn btn-icon btn-danger" onClick={() => onDelete(location.id)}>
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="category-children">
                    {location.subLocations?.map((child) => (
                        <LocationItem
                            key={child.id}
                            location={child}
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
