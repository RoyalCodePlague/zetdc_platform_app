import api from './api';
import { Meter, Paginated } from '@/types/models';

export const metersService = {
  async getMeters(params?: Record<string, unknown>): Promise<Meter[] | Paginated<Meter>> {
    const response = await api.get('/meters/', { params });
    return response.data;
  },

  async getMeter(id: string): Promise<Meter> {
    const response = await api.get(`/meters/${id}/`);
    return response.data;
  },

  async createMeter(data: Partial<Meter>) {
    const response = await api.post('/meters/', data);
    return response.data;
  },

  async updateMeter(id: string, data: Partial<Meter>) {
    const response = await api.patch(`/meters/${id}/`, data);
    return response.data;
  },

  async deleteMeter(id: string) {
    const response = await api.delete(`/meters/${id}/`);
    return response.data;
  },

  async purchaseElectricity(meterId: string, amount: number) {
    const response = await api.post(`/meters/${meterId}/purchase_electricity/`, {
      amount,
    });
    return response.data;
  },

  async rechargeToken(meterId: string, token: string) {
    const response = await api.post(`/meters/${meterId}/recharge_token/`, {
      token,
    });
    return response.data;
  },

  async applyToken(meterId: string, token: string, units?: number, force?: boolean) {
    const payload: Record<string, unknown> = { token };
    if (units != null) payload.units = units;
    if (force) payload.force = true;
    const response = await api.post(`/meters/${meterId}/apply_token/`, payload);
    return response.data as unknown;
  },

  // Auto-recharge endpoints
  async getAutoRechargeConfig() {
    const response = await api.get('/meters/auto-recharge/settings/');
    return response.data;
  },

  async saveAutoRechargeConfig(payload: Record<string, unknown>) {
    const response = await api.post('/meters/auto-recharge/settings/', payload);
    return response.data;
  },

  async listAutoRechargeEvents() {
    const response = await api.get('/meters/auto-recharge/events/');
    return response.data;
  },

  async runAutoRechargeNow() {
    const response = await api.post('/meters/auto-recharge/run-now/');
    return response.data;
  },

  async triggerAutoRecharge(meterId: string, amount?: number) {
    const response = await api.post(`/meters/auto-recharge/trigger/${meterId}/`, { amount });
    return response.data;
  }
};