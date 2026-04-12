import apiClient from './apiClient';

const serviceRequestService = {
  getCatalog: async () => {
    const response = await apiClient.get('/servicerequests/catalog');
    return response.data || [];
  },
  submitRequest: async (data) => {
    const response = await apiClient.post('/servicerequests', data);
    return response.data;
  },
  getRequestDetails: async (id) => {
    const response = await apiClient.get(`/servicerequests/${id}`);
    return response.data;
  },
  approveRequest: async (approvalId, approve, comments) => {
    const response = await apiClient.post(`/servicerequests/approve/${approvalId}`, { approve, comments });
    return response.data;
  },
  completeRequest: async (requestId, comments) => {
    const response = await apiClient.post(`/servicerequests/complete/${requestId}`, { comments });
    return response.data;
  },
  completeTask: async (taskId, comments) => {
    const response = await apiClient.post(`/servicerequests/tasks/${taskId}/complete`, { comments });
    return response.data;
  },
  getQueue: async () => {
    const response = await apiClient.get('/servicerequests/queue');
    return response.data || [];
  },
  getMyRequests: async () => {
    const response = await apiClient.get('/servicerequests/my');
    return response.data || [];
  },
  updateRequest: async (id, data) => {
    const response = await apiClient.put(`/servicerequests/${id}`, data);
    return response.data;
  },
  advanceStage: async (id, stage) => {
    try {
      const response = await apiClient.post(`/servicerequests/${id}/advance`, { stage });
      return response.data;
    } catch {
      const response = await apiClient.put(`/servicerequests/${id}`, { workflowStage: stage });
      return response.data;
    }
  }
};

export default serviceRequestService;
