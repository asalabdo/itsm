import apiClient from './apiClient';

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

export default ticketsAPI;
