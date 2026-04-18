import apiClient, { erpApiClient } from './apiClient';

// Tickets API
const postTicketActionWithFallback = async (id, action, payload, fallbackPatch) => {
  try {
    return await apiClient.post(`/tickets/${id}/${action}`, payload);
  } catch (error) {
    if (fallbackPatch) {
      return apiClient.put(`/tickets/${id}`, fallbackPatch);
    }
    throw error;
  }
};

export const ticketsAPI = {
  getAll: () => apiClient.get('/tickets'),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  create: (data) => apiClient.post('/tickets', data),
  update: (id, data) => apiClient.put(`/tickets/${id}`, data),
  delete: (id) => apiClient.delete(`/tickets/${id}`),
  getByStatus: (status) => apiClient.get(`/tickets/status/${status}`),
  getByAssignee: (userId) => apiClient.get(`/tickets/assignee/${userId}`),
  addComment: (id, comment) => apiClient.post(`/tickets/${id}/comments`, { comment }),
  addReply: (id, data) => apiClient.post(`/tickets/${id}/replies`, data),
  addInternalNote: (id, data) => apiClient.post(`/tickets/${id}/notes`, data),
  updateStatus: (id, status) => apiClient.post(`/tickets/${id}/status`, { status }),
  updatePriority: (id, priority) => apiClient.post(`/tickets/${id}/priority`, { priority }),
  reopen: (id, reason) => apiClient.post(`/tickets/${id}/reopen`, { reason }),
  assign: (id, assignedTo) => {
    const payload = typeof assignedTo === 'object' && assignedTo !== null
      ? assignedTo
      : { assignedToId: assignedTo };

    return postTicketActionWithFallback(
      id,
      'assign',
      payload,
      payload
    );
  },
  escalate: (id, data = {}) => postTicketActionWithFallback(
    id,
    'escalate',
    data,
    { priority: 'Critical', status: 'In Progress' }
  ),
  submitFeedback: (id, data) => apiClient.post(`/tickets/${id}/feedback`, data),
  startTimeTracking: (id, data = {}) => apiClient.post(`/tickets/${id}/time/start`, data),
  stopTimeTracking: (id, data = {}) => apiClient.post(`/tickets/${id}/time/stop`, data),
  uploadAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/tickets/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAttachments: (id) => apiClient.get(`/tickets/${id}/attachments`),
  downloadAttachment: (id, attachmentId) => apiClient.get(`/tickets/${id}/attachments/${attachmentId}`, {
    responseType: 'blob'
  }),
  getOpenCount: () => apiClient.get('/tickets/statistics/open-count'),
  getStatistics: () => apiClient.get('/tickets/statistics'),
  search: (params) => apiClient.get('/tickets/search', { params }),
  refreshSla: () => apiClient.post('/tickets/sla/refresh'),
};

// Assets API
export const assetsAPI = {
  getAll: () => apiClient.get('/v1/assets'),
  getById: (id) => apiClient.get(`/v1/assets/${id}`),
  create: (data) => apiClient.post('/v1/assets', data),
  update: (id, data) => apiClient.put(`/v1/assets/${id}`, data),
  delete: (id) => apiClient.delete(`/v1/assets/${id}`),
  getByStatus: (status) => apiClient.get(`/v1/assets/status/${status}`),
  getByType: (assetType) => apiClient.get(`/v1/assets/type/${assetType}`),
  getByOwnerId: (ownerId) => apiClient.get(`/v1/assets/owner/${ownerId}`),
  getActiveCount: () => apiClient.get('/v1/assets/statistics/active-count'),
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

// Session API
export const sessionAPI = {
  getCurrentLoginInformations: () =>
    erpApiClient.get('/services/app/Session/GetCurrentLoginInformations'),
};

export const organizationUnitAPI = {
  getUsers: (id, maxResultCount = 10, skipCount = 0) =>
    erpApiClient.get('/services/app/OrganizationUnit/GetOrganizationUnitUsers', {
      params: {
        Id: id,
        MaxResultCount: maxResultCount,
        SkipCount: skipCount,
      },
    }),
};

// Dashboard API
export const dashboardAPI = {
  getSummary: () => apiClient.get('/dashboard/summary'),
  getPerformanceMetrics: (category) => apiClient.get(`/dashboard/metrics/${category}`),
  getAllMetrics: () => apiClient.get('/dashboard/all-metrics'),
};

// Reports API
export const reportsAPI = {
  getOverview: (days = 30) => apiClient.get('/reports/overview', { params: { days } }),
  getSlaCompliance: (days = 30) => apiClient.get('/reports/sla-compliance', { params: { days } }),
  getTrends: (days = 30) => apiClient.get('/reports/trends', { params: { days } }),
  getTechnicians: (days = 30) => apiClient.get('/reports/technicians', { params: { days } }),
  getCategories: () => apiClient.get('/reports/categories'),
};

// SLA API
export const slaAPI = {
  getPolicies: () => apiClient.get('/sla/policies'),
  getPolicy: (key) => apiClient.get(`/sla/policies/${key}`),
  getPriorities: () => apiClient.get('/sla/priorities'),
  getEscalations: () => apiClient.get('/sla/escalations'),
  getTickets: () => apiClient.get('/sla/tickets'),
  getTicketById: (id) => apiClient.get(`/sla/tickets/${id}`),
  lookup: (params = {}) => apiClient.get('/sla/lookup', { params }),
};

// Knowledge Base API
export const knowledgeBaseAPI = {
  getArticles: () => apiClient.get('/knowledgebase/articles'),
  getArticle: (id) => apiClient.get(`/knowledgebase/articles/${id}`),
  search: (query) => apiClient.get('/knowledgebase/search', { params: { q: query } }),
};

// Settings API
export const settingsAPI = {
  getProfile: () => apiClient.get('/settings/profile'),
  updateProfile: (data) => apiClient.put('/settings/profile', data),
  getModules: () => apiClient.get('/settings/modules'),
};

// Approvals API
export const approvalsAPI = {
  getAll: () => apiClient.get('/approvals'),
  getPending: () => apiClient.get('/approvals/pending'),
  getForUser: (userId) => apiClient.get(`/approvals/user/${userId}`),
  getById: (id) => apiClient.get(`/approvals/${id}`),
  update: (id, data) => apiClient.put(`/approvals/${id}`, data),
  getHistory: () => apiClient.get('/approvals'),
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
  getCatalog: () => apiClient.get('/servicerequests/catalog'),
  getByStatus: (status) => apiClient.get(`/servicerequests/status/${status}`),
};

export const servicesAPI = serviceRequestsAPI;

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

// Problems API
export const problemAPI = {
  getAll: () => apiClient.get('/problems'),
  getById: (id) => apiClient.get(`/problems/${id}`),
  create: (data) => apiClient.post('/problems', data),
  update: (id, data) => apiClient.put(`/problems/${id}`, data),
  linkTicket: (id, ticketId) => apiClient.post(`/problems/${id}/link-ticket`, { ticketId }),
};

// Monitoring API
export const monitoringAPI = {
  ping: () => apiClient.get('/monitoring/events/ping'),
  createEvent: (data) => apiClient.post('/monitoring/events', data),
};

// ManageEngine Integration API
export const manageEngineAPI = {
  syncIncidents: () => apiClient.post('/manageengine/sync'),
  testConnection: () => apiClient.post('/manageengine/test-connection'),
  getSettings: () => apiClient.get('/manageengine/settings'),
  updateSettings: (data) => apiClient.put('/manageengine/settings', data),
  getIncidents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/manageengine/incidents${queryString ? `?${queryString}` : ''}`);
  },
  getCatalog: (params = {}) => apiClient.get('/manageengine/catalog', { params }),
  getOperations: (params = {}) => apiClient.get('/manageengine/operations', { params }),
  getUnified: (params = {}) => apiClient.get('/manageengine/unified', { params }),
  getSyncStatus: () => apiClient.get('/manageengine/sync-status'),
};
