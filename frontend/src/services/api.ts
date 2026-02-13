import axios from 'axios';
import { Personel, MalzemeKalemi, Depo, Category as Kategori, Location, Category } from '../types';

// API Base URL - Backend adresinizle eşleşmeli
const API_URL = 'http://localhost:5108/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Pagination Response Interface
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
}

// Personel Servisi
export const personelService = {
    getAll: async () => {
        const response = await api.get<Personel[]>('/personeller');
        return response.data;
    },
    getPaged: async (page: number, pageSize: number, search?: string) => {
        const response = await api.get<PagedResult<Personel>>('/personeller/paged', {
            params: { pageNumber: page, pageSize, searchTerm: search }
        });
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

// Malzeme Kalemi Servisi
export const malzemeKalemiService = {
    getAll: async () => {
        const response = await api.get<MalzemeKalemi[]>('/malzemekalemleri');
        return response.data;
    },
    getPaged: async (page: number, pageSize: number, search?: string, kategoriId?: number) => {
        const response = await api.get<PagedResult<MalzemeKalemi>>('/malzemekalemleri/paged', {
            params: { pageNumber: page, pageSize, searchTerm: search, kategoriId }
        });
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get<MalzemeKalemi>(`/malzemekalemleri/${id}`);
        return response.data;
    },
    create: async (data: Omit<MalzemeKalemi, 'id'>) => {
        const response = await api.post<MalzemeKalemi>('/malzemekalemleri', data);
        return response.data;
    },
    update: async (id: number, data: Partial<MalzemeKalemi>) => {
        const response = await api.put<MalzemeKalemi>(`/malzemekalemleri/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/malzemekalemleri/${id}`);
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
    getPaged: async (page: number, pageSize: number, search?: string) => {
        const response = await api.get<PagedResult<Kategori>>('/kategoriler/paged', {
            params: { pageNumber: page, pageSize, searchTerm: search }
        });
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
    },
    getTree: async () => {
        const response = await api.get<any[]>('/kategoriler/tree'); // any[] because types might not be reloaded yet, or use Category[]
        return response.data;
    }
};

// Cari Servisi
export const cariService = {
    getAll: async () => {
        const response = await api.get('/cariler');
        return response.data;
    },
    getPaged: async (page: number, pageSize: number, search?: string) => {
        const response = await api.get<PagedResult<any>>('/cariler/paged', { // Using any for CariDto if types not fully generic yet
            params: { pageNumber: page, pageSize, searchTerm: search }
        });
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
    getPaged: async (page: number, pageSize: number, search?: string) => {
        const response = await api.get<PagedResult<any>>('/faturalar/paged', {
            params: { pageNumber: page, pageSize, searchTerm: search }
        });
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
    },
    uploadPdf: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/faturalar/upload-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

// Zimmet Servisi
export const zimmetService = {
    getAll: async () => {
        const response = await api.get('/zimmetler');
        return response.data;
    },
    getPaged: async (page: number, pageSize: number, search?: string, zimmetDurum?: string) => {
        const response = await api.get<PagedResult<any>>('/zimmetler/paged', {
            params: { pageNumber: page, pageSize, searchTerm: search, zimmetDurum }
        });
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
    },
    getByPersonelId: async (personelId: number) => {
        const response = await api.get<any[]>(`/zimmetler/personel/${personelId}`); // Backend returns ZimmetDto list
        return response.data;
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
    },
    delete: async (id: number) => {
        await api.delete(`/talepler/${id}`);
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

// Bolum Servisi
export const bolumService = {
    getTree: async () => {
        const response = await api.get<Location[]>('/bolumler/tree'); // Location type needs to be imported if strictly checked but usually fine here
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/bolumler');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/bolumler/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/bolumler', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/bolumler/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/bolumler/${id}`);
    }
};

export default api;
