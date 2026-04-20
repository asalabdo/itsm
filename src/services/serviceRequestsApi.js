import apiClient from './apiClient';

export const serviceRequestsAPI = {
  getAll: () => apiClient.get('/servicerequests'),
  getById: (id) => apiClient.get(`/servicerequests/${id}`),
  create: (data) => apiClient.post('/servicerequests', data),
  update: (id, data) => apiClient.put(`/servicerequests/${id}`, data),
  delete: (id) => apiClient.delete(`/servicerequests/${id}`),
  getCatalog: () => apiClient.get('/servicerequests/catalog'),
  getByStatus: (status) => apiClient.get(`/servicerequests/status/${status}`),
};

export const servicesAPI = serviceRequestsAPI;

export default serviceRequestsAPI;
