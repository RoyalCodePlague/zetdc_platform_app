import api from './api';
import { Paginated } from '@/types/models';

export const rechargesService = {
  async list(params?: Record<string, unknown>) {
    const response = await api.get('/recharges/', { params });
    return response.data;
  },

  async get(id: string) {
    const response = await api.get(`/recharges/${id}/`);
    return response.data;
  }
};
