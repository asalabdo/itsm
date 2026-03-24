import apiClient from './apiClient';

const reportingService = {
  getOverview: async (days = 30) => {
    const res = await apiClient.get(`/reports/overview?days=${days}`);
    return res.data;
  },
  getTicketVolume: async (days = 30) => {
    const res = await apiClient.get(`/reports/ticket-volume?days=${days}`);
    return res.data || [];
  },
  getCategoryBreakdown: async () => {
    const res = await apiClient.get('/reports/category-breakdown');
    return res.data || [];
  },
  getTopPerformers: async () => {
    const res = await apiClient.get('/reports/top-performers');
    return res.data || [];
  },
  getSlaCompliance: async (days = 30) => {
    const res = await apiClient.get(`/reports/sla-compliance?days=${days}`);
    return res.data;
  },
};

export default reportingService;
