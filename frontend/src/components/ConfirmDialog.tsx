import { X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
    zIndex?: number;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    onConfirm,
    onCancel,
    variant = 'info',
    zIndex
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: 'btn-danger',
        warning: 'btn-warning',
        info: 'btn-primary'
    };

    return (
        <div className="modal-overlay" onClick={onCancel} style={{ zIndex }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onCancel}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{message}</p>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
                    <button type="button" className={`btn ${variantStyles[variant]}`} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}
