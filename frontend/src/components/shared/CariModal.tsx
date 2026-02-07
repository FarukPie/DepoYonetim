import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cariService } from '../../services/api';
import { getIller, getIlceler, getVergiDaireleri } from '../../data/turkiyeData';
import { Cari } from '../../types';

interface CariModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingCari?: Cari | null;
}

export default function CariModal({ isOpen, onClose, onSuccess, editingCari }: CariModalProps) {
    const [formData, setFormData] = useState({
        firmaAdi: '', tip: 'Tedarikci', ticaretSicilNo: '', vergiNo: '', vergiDairesi: '',
        adres: '', il: '', ilce: '', telefon: '', fax: '',
        email: '', webSitesi: '', yetkiliKisi: '', yetkiliTelefon: '',
        bankaAdi: '', ibanNo: ''
    });

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
                fax: editingCari.fax || '',
                email: editingCari.email || '',
                webSitesi: editingCari.webSitesi || '',
                yetkiliKisi: editingCari.yetkiliKisi || '',
                yetkiliTelefon: editingCari.yetkiliTelefon || '',
                bankaAdi: editingCari.bankaAdi || '',
                ibanNo: editingCari.ibanNo || ''
            });
        } else {
            resetForm();
        }
    }, [editingCari, isOpen]);

    const resetForm = () => {
        setFormData({
            firmaAdi: '', tip: 'Tedarikci', ticaretSicilNo: '', vergiNo: '', vergiDairesi: '',
            adres: '', il: '', ilce: '', telefon: '', fax: '',
            email: '', webSitesi: '', yetkiliKisi: '', yetkiliTelefon: '',
            bankaAdi: '', ibanNo: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCari) {
                await cariService.update(editingCari.id, formData);
            } else {
                await cariService.create(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu.');
        }
    };

    if (!isOpen) return null;

    return (
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

                        <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
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
                                    onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, vergiDairesi: e.target.value })}>
                                    <option value="">Vergi Dairesi Seçiniz</option>
                                    {formData.il && getVergiDaireleri(formData.il).map((vd) => (
                                        <option key={vd} value={vd}>{vd}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Adres</label>
                            <input type="text" className="form-input" value={formData.adres}
                                placeholder="Adres"
                                onChange={(e) => setFormData({ ...formData, adres: e.target.value })} />
                        </div>

                        <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Telefon</label>
                                <input type="text" className="form-input" value={formData.telefon}
                                    placeholder="Telefon"
                                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} />
                            </div>
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
                        </div>

                        <div className="grid-3" style={{ gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Yetkili Telefon</label>
                                <input type="text" className="form-input" value={formData.yetkiliTelefon}
                                    placeholder="Yetkili Telefon"
                                    onChange={(e) => setFormData({ ...formData, yetkiliTelefon: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Banka Adı</label>
                                <input type="text" className="form-input" value={formData.bankaAdi}
                                    placeholder="Banka Adı"
                                    onChange={(e) => setFormData({ ...formData, bankaAdi: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">IBAN No</label>
                                <input type="text" className="form-input" value={formData.ibanNo}
                                    placeholder="IBAN No"
                                    onChange={(e) => setFormData({ ...formData, ibanNo: e.target.value })} />
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
    );
}
