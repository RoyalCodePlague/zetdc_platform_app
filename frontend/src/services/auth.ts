import api from './api';
import { AxiosError } from 'axios';
import { User } from '@/types/models';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  meter_number?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await api.post('/auth/login/', {
        email: credentials.email,
        password: credentials.password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      return { access, refresh, user };
    } catch (error) {
      const err = error as AxiosError<unknown>;
      const getMessage = (e: AxiosError<unknown>) => {
        const data = e.response ? ((e.response as { data?: unknown }).data) : undefined;
        if (!data) return 'Invalid email or password.';
        if (typeof data === 'string') return data;
        if (typeof data === 'object' && data !== null) {
          const obj = data as Record<string, unknown>;
          if (obj.detail) return String(obj.detail);
          try {
            const values = Object.values(obj).flatMap(v => Array.isArray(v) ? v : [v]);
            return values.map(v => String(v)).join(' ');
          } catch {
            return 'Invalid email or password.';
          }
        }
        return 'Invalid email or password.';
      };
      throw new Error(getMessage(err));
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await api.post('/users/', data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<unknown>;
      const data = err.response ? ((err.response as { data?: unknown }).data) : undefined;
      let message = 'Registration failed.';
      if (data) {
        if (typeof data === 'string') message = data;
        else if (typeof data === 'object' && data !== null) {
          const obj = data as Record<string, unknown>;
          if (obj.detail) message = String(obj.detail);
          else {
            try { message = Object.values(obj).flatMap(v => Array.isArray(v) ? v : [v]).map(v => String(v)).join(' '); } catch { message = 'Registration failed.'; }
          }
        }
      }
      throw new Error(message);
    }
  },

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser() {
    const response = await api.get('/users/me/');
    return response.data as User;
  },

  async updateProfile(data: Partial<RegisterData>) {
    const response = await api.patch('/users/update_profile/', data);
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  async verifyToken(token: string) {
    try {
      const response = await api.post('/auth/verify-token/', { token });
      return response.data.valid;
    } catch {
      return false;
    }
  },
};
