import apiClient from './apiClient';

const approvalService = {
  getAll: async () => {
    const response = await apiClient.get('/approvals');
    return response.data;
  },
  getPending: async () => {
    const response = await apiClient.get('/approvals/pending');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/approvals/${id}`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/approvals/${id}`, data);
    return response.data;
  }
};

export default approvalService;
