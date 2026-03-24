import apiClient from './apiClient';

const userService = {
  getAll: async () => {
    const res = await apiClient.get('/users');
    return res.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/users', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default userService;
