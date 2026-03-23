import apiClient from './apiClient';

// Tickets API
export const ticketsAPI = {
  getAll: () => apiClient.get('/tickets'),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  create: (data) => apiClient.post('/tickets', data),
  update: (id, data) => apiClient.put(`/tickets/${id}`, data),
  delete: (id) => apiClient.delete(`/tickets/${id}`),
  getByStatus: (status) => apiClient.get(`/tickets/status/${status}`),
  getByAssignee: (userId) => apiClient.get(`/tickets/assignee/${userId}`),
  addComment: (id, comment) => apiClient.post(`/tickets/${id}/comments`, { comment }),
  getOpenCount: () => apiClient.get('/tickets/statistics/open-count'),
};

// Assets API
export const assetsAPI = {
  getAll: () => apiClient.get('/assets'),
  getById: (id) => apiClient.get(`/assets/${id}`),
  create: (data) => apiClient.post('/assets', data),
  update: (id, data) => apiClient.put(`/assets/${id}`, data),
  delete: (id) => apiClient.delete(`/assets/${id}`),
  getByStatus: (status) => apiClient.get(`/assets/status/${status}`),
  getByType: (assetType) => apiClient.get(`/assets/type/${assetType}`),
  getActiveCount: () => apiClient.get('/assets/statistics/active-count'),
};

// Users API
export const usersAPI = {
  getAll: () => apiClient.get('/users'),
  getById: (id) => apiClient.get(`/users/${id}`),
  getByUsername: (username) => apiClient.get(`/users/username/${username}`),
  create: (data) => apiClient.post('/users', data),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  getByRole: (role) => apiClient.get(`/users/role/${role}`),
};

// Dashboard API
export const dashboardAPI = {
  getSummary: () => apiClient.get('/dashboard/summary'),
  getPerformanceMetrics: (category) => apiClient.get(`/dashboard/metrics/${category}`),
  getAllMetrics: () => apiClient.get('/dashboard/all-metrics'),
};

// Approvals API
export const approvalsAPI = {
  getAll: () => apiClient.get('/approvals'),
  getPending: () => apiClient.get('/approvals/pending'),
  getForUser: (userId) => apiClient.get(`/approvals/user/${userId}`),
  getById: (id) => apiClient.get(`/approvals/${id}`),
  update: (id, data) => apiClient.put(`/approvals/${id}`, data),
};

// Change Requests API
export const changeRequestsAPI = {
  getAll: () => apiClient.get('/changerequests'),
  getById: (id) => apiClient.get(`/changerequests/${id}`),
  create: (data) => apiClient.post('/changerequests', data),
  update: (id, data) => apiClient.put(`/changerequests/${id}`, data),
  delete: (id) => apiClient.delete(`/changerequests/${id}`),
  getByStatus: (status) => apiClient.get(`/changerequests/status/${status}`),
};

// Service Requests API
export const serviceRequestsAPI = {
  getAll: () => apiClient.get('/servicerequests'),
  getById: (id) => apiClient.get(`/servicerequests/${id}`),
  create: (data) => apiClient.post('/servicerequests', data),
  update: (id, data) => apiClient.put(`/servicerequests/${id}`, data),
  delete: (id) => apiClient.delete(`/servicerequests/${id}`),
  getByStatus: (status) => apiClient.get(`/servicerequests/status/${status}`),
};

// Workflows API
export const workflowsAPI = {
  getAll: () => apiClient.get('/workflows'),
  getById: (id) => apiClient.get(`/workflows/${id}`),
  create: (data) => apiClient.post('/workflows', data),
  update: (id, data) => apiClient.put(`/workflows/${id}`, data),
  delete: (id) => apiClient.delete(`/workflows/${id}`),
  createInstance: (id) => apiClient.post(`/workflows/${id}/instances`),
  getInstances: (id) => apiClient.get(`/workflows/${id}/instances`),
};
