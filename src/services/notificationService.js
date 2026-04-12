import apiClient from './apiClient';

const notificationService = {
  getNotifications: async () => {
    try {
      const res = await apiClient.get('/notifications');
      return res.data || [];
    } catch {
      return [];
    }
  },
  markAsRead: async (id) => {
    try {
      const res = await apiClient.post(`/notifications/${id}/read`);
      return res.data;
    } catch {
      return null;
    }
  },
  markAllAsRead: async () => {
    try {
      const res = await apiClient.post('/notifications/read-all');
      return res.data;
    } catch {
      return null;
    }
  },
};

export default notificationService;
