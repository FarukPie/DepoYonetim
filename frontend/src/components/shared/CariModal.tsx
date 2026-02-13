import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cariService } from '../../services/api';
import { getIller, getIlceler, getVergiDaireleri } from '../../data/turkiyeData';
import { Cari } from '../../types';
import ConfirmDialog from '../ConfirmDialog';

interface CariModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingCari?: Cari | null;
}

export default function CariModal({ isOpen, onClose, onSuccess, editingCari }: CariModalProps) {
    const [formData, setFormData] = useState({
        firmaAdi: '', tip: 'Tedarikci', ticaretSicilNo: '', vergiNo: '', vergiDairesi: '',
        adres: '', il: '', ilce: '', telefon: '',
        email: '', yetkiliKisi: '', yetkiliTelefon: '', hastaneKod: ''
    });

    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [isAnaFirma, setIsAnaFirma] = useState(false);

    useEffect(() => {
        if (editingCari) {
            setFormData({
                firmaAdi: editingCari.firmaAdi,
                tip: editingCari.tip,
                ticaretSicilNo: editingCari.ticaretSicilNo || '',
                vergiNo: editingCari.vergiNo || '',
                vergiDairesi: editingCari.vergiDairesi || '',
                adres: editingCari.adres || '',
                il: editingCari.il || '',
                ilce: editingCari.ilce || '',
                telefon: editingCari.telefon || '',
                email: editingCari.email || '',
                yetkiliKisi: editingCari.yetkiliKisi || '',
                yetkiliTelefon: editingCari.yetkiliTelefon || '',
                hastaneKod: editingCari.hastaneKod || ''
            });
            setIsAnaFirma(!!editingCari.hastaneKod);
        } else {
            resetForm();
        }
    }, [editingCari, isOpen]);

    const resetForm = () => {
        setFormData({
            firmaAdi: '', tip: 'Tedarikci', ticaretSicilNo: '', vergiNo: '', vergiDairesi: '',
            adres: '', il: '', ilce: '', telefon: '',
            email: '', yetkiliKisi: '', yetkiliTelefon: '', hastaneKod: ''
        });
        setIsAnaFirma(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSaveConfirm(true);
    };

    const confirmSave = async () => {
        try {
            const dataToSave = { ...formData, hastaneKod: isAnaFirma ? formData.hastaneKod : '' };
            if (editingCari) {
                await cariService.update(editingCari.id, dataToSave);
            } else {
                await cariService.create(dataToSave);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        } finally {
            setShowSaveConfirm(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                    <div className="modal-header">
                        <h2 style={{ fontSize: '1.25rem' }}>{editingCari ? 'Cari Düzenle' : 'Cari Ekle'}</h2>
                        <button className="modal-close" onClick={onClose}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Firma Adı</label>
                                    <input type="text" className="form-input" required value={formData.firmaAdi}
                                        placeholder="Firma Adı"
                                        onChange={(e) => setFormData({ ...formData, firmaAdi: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ticaret Sicil No</label>
                                    <input type="text" className="form-input" value={formData.ticaretSicilNo}
                                        placeholder="Ticaret Sicil No"
                                        onChange={(e) => setFormData({ ...formData, ticaretSicilNo: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vergi No</label>
                                    <input type="text" className="form-input" value={formData.vergiNo}
                                        placeholder="Vergi No"
                                        onChange={(e) => setFormData({ ...formData, vergiNo: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid-3" style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">İl</label>
                                    <select className="form-select" value={formData.il}
                                        onChange={(e) => setFormData({ ...formData, il: e.target.value, ilce: '', vergiDairesi: '' })}>
                                        <option value="">İl Seçiniz</option>
                                        {getIller().map((il) => (
                                            <option key={il} value={il}>{il}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">İlçe</label>
                                    <select className="form-select" value={formData.ilce}
                                        onChange={(e) => {
                                            const newIlce = e.target.value;
                                            const daireler = getVergiDaireleri(formData.il, newIlce);
                                            setFormData({
                                                ...formData,
                                                ilce: newIlce,
                                                vergiDairesi: daireler.length === 1 ? daireler[0] : ''
                                            });
                                        }}
                                        disabled={!formData.il}>
                                        <option value="">İlçe Seçiniz</option>
                                        {formData.il && getIlceler(formData.il).map((ilce) => (
                                            <option key={ilce} value={ilce}>{ilce}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vergi Dairesi</label>
                                    <select className="form-select" value={formData.vergiDairesi}
                                        onChange={(e) => setFormData({ ...formData, vergiDairesi: e.target.value })}
                                        disabled={!formData.ilce}>
                                        <option value="">Vergi Dairesi Seçiniz</option>
                                        {formData.il && getVergiDaireleri(formData.il, formData.ilce).map((vd) => (
                                            <option key={vd} value={vd}>{vd}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Telefon</label>
                                    <input type="text" className="form-input" value={formData.telefon}
                                        placeholder="Telefon"
                                        onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Adres</label>
                                    <input type="text" className="form-input" value={formData.adres}
                                        placeholder="Adres"
                                        onChange={(e) => setFormData({ ...formData, adres: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid-3" style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">E-posta</label>
                                    <input type="email" className="form-input" value={formData.email}
                                        placeholder="E-posta"
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Yetkili Kişi</label>
                                    <input type="text" className="form-input" value={formData.yetkiliKisi}
                                        placeholder="Yetkili Kişi"
                                        onChange={(e) => setFormData({ ...formData, yetkiliKisi: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Yetkili Telefon</label>
                                    <input type="text" className="form-input" value={formData.yetkiliTelefon}
                                        placeholder="Yetkili Telefon"
                                        onChange={(e) => setFormData({ ...formData, yetkiliTelefon: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div className="form-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="checkbox"
                                            id="anaFirmaCheck"
                                            checked={isAnaFirma}
                                            onChange={(e) => setIsAnaFirma(e.target.checked)}
                                            style={{ width: '16px', height: '16px' }}
                                        />
                                        <label htmlFor="anaFirmaCheck" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Ana Firma</label>
                                    </div>

                                    {isAnaFirma && (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.hastaneKod}
                                            placeholder="Hastane Kodu"
                                            style={{ width: '25%' }}
                                            onChange={(e) => setFormData({ ...formData, hastaneKod: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>İptal</button>
                            <button type="submit" className="btn btn-primary">{editingCari ? 'Güncelle' : 'Kaydet'}</button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showSaveConfirm}
                title={editingCari ? 'Cari Güncelleme' : 'Yeni Cari Kaydı'}
                message={editingCari ? 'Cari bilgilerini güncellemek istediğinize emin misiniz?' : 'Yeni cariyi kaydetmek istediğinize emin misiniz?'}
                onConfirm={confirmSave}
                onCancel={() => setShowSaveConfirm(false)}
                confirmText={editingCari ? 'Güncelle' : 'Kaydet'}
                variant="info"
            />
        </>
    );
}
