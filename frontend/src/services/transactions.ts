import api from './api';
import { Transaction, Paginated } from '@/types/models';

export const transactionsService = {
  // Returns either an array or paginated results depending on backend
  async getTransactions(params?: Record<string, unknown>): Promise<Transaction[] | Paginated<Transaction>> {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  async getTransaction(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  },
};