import apiClient from './apiClient';

const assetService = {
  getAll: async () => {
    const res = await apiClient.get('/v1/assets');
    return res.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/v1/assets/${id}`);
    return res.data;
  },
  getByOwnerId: async (ownerId) => {
    const res = await apiClient.get(`/v1/assets/owner/${ownerId}`);
    return res.data || [];
  },
  create: async (data) => {
    const res = await apiClient.post('/v1/assets', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/v1/assets/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/v1/assets/${id}`);
    return res.data;
  },
};

export default assetService;
