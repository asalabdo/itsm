import apiClient from './apiClient';

const assetService = {
  getAll: async () => {
    const res = await apiClient.get('/assets');
    return res.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/assets/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/assets', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/assets/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/assets/${id}`);
    return res.data;
  },
};

export default assetService;
