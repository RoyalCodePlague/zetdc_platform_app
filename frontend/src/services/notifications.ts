import api from './api';

export const notificationsService = {
  async getNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },

  async markAsUnread(id: string) {
    const response = await api.post(`/notifications/${id}/mark_unread/`);
    return response.data;
  },

  async deleteNotification(id: string) {
    const response = await api.delete(`/notifications/${id}/`);
    return response.data;
  },
  async deleteAll() {
    const response = await api.delete('/notifications/delete_all/');
    return response.data;
  },

  async getSettings() {
    const response = await api.get('/notifications/settings/');
    return response.data;
  },

  async saveSettings(payload: Record<string, unknown>) {
    const response = await api.post('/notifications/settings/', payload);
    return response.data;
  },
};