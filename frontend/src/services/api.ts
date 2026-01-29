import axios from 'axios';
import { Personel, Urun, Depo, Kategori } from '../types';

// API Base URL - Backend adresinizle eşleşmeli
const API_URL = 'http://localhost:5108/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Personel Servisi
export const personelService = {
    getAll: async () => {
        const response = await api.get<Personel[]>('/personeller');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<Personel>(`/personeller/${id}`);
        return response.data;
    },
    create: async (data: Omit<Personel, 'id'>) => {
        const response = await api.post<Personel>('/personeller', data);
        return response.data;
    },
    update: async (id: number, data: Partial<Personel>) => {
        const response = await api.put<Personel>(`/personeller/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/personeller/${id}`);
    }
};

// Ürün Servisi
export const urunService = {
    getAll: async () => {
        const response = await api.get<Urun[]>('/urunler');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<Urun>(`/urunler/${id}`);
        return response.data;
    },
    create: async (data: Omit<Urun, 'id'>) => {
        const response = await api.post<Urun>('/urunler', data);
        return response.data;
    },
    update: async (id: number, data: Partial<Urun>) => {
        const response = await api.put<Urun>(`/urunler/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/urunler/${id}`);
    }
};

// Depo Servisi
export const depoService = {
    getAll: async () => {
        const response = await api.get<Depo[]>('/depolar');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post<Depo>('/depolar', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put<Depo>(`/depolar/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/depolar/${id}`);
    }
};

// Kategori Servisi
export const kategoriService = {
    getAll: async () => {
        const response = await api.get<Kategori[]>('/kategoriler');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post<Kategori>('/kategoriler', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put<Kategori>(`/kategoriler/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/kategoriler/${id}`);
    }
};

// Cari Servisi
export const cariService = {
    getAll: async () => {
        const response = await api.get('/cariler');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/cariler', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/cariler/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/cariler/${id}`);
    }
};

// Fatura Servisi
export const faturaService = {
    getAll: async () => {
        const response = await api.get('/faturalar');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/faturalar', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/faturalar/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/faturalar/${id}`);
    }
};

// Zimmet Servisi
export const zimmetService = {
    getAll: async () => {
        const response = await api.get('/zimmetler');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/zimmetler', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/zimmetler/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/zimmetler/${id}`);
    }
};

// Rol Servisi
export const roleService = {
    getAll: async () => {
        const response = await api.get('/roles');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/roles', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/roles/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/roles/${id}`);
    }
};

// Log Servisi
export const logService = {
    getAll: async (params?: any) => {
        const response = await api.get('/logs', { params });
        return response.data;
    }
};

// Dashboard Servisi
export const dashboardService = {
    getStats: async () => {
        const response = await api.get('/dashboard');
        return response.data;
    }
};

// Talepler Servisi
export const taleplerService = {
    getAll: async (durum?: string) => {
        const url = durum ? `/talepler?durum=${durum}` : '/talepler';
        const response = await api.get<any[]>(url); // TalepDto types can be added later
        return response.data;
    },
    getByUser: async (userId: number) => {
        const response = await api.get<any[]>(`/talepler/user/${userId}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/talepler', data);
        return response.data;
    },
    onayla: async (id: number, onaylayanUserId: number) => {
        const response = await api.put(`/talepler/${id}/onayla`, { onaylayanUserId });
        return response.data;
    },
    reddet: async (id: number, onaylayanUserId: number, redNedeni: string) => {
        const response = await api.put(`/talepler/${id}/reddet`, { onaylayanUserId, redNedeni });
        return response.data;
    },
    getBekleyenSayisi: async () => {
        const response = await api.get<number>('/talepler/bekleyen-sayisi');
        return response.data;
    }
};

// Kullanıcı Servisi
export const userService = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/users/${id}`);
    }
};

export default api;
