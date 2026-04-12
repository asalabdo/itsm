import apiClient from './apiClient';

/**
 * Service for Advanced Analytics and Predictive Insights
 */
const analyticsService = {
  /**
   * Get advanced hub data including heatmap and insights
   * @returns {Promise<Object>} Advanced analytics data
   */
  getAdvancedHub: async () => {
    const response = await apiClient.get('/analytics/advanced-hub');
    return response.data || {};
  },

  /**
   * Get predictive insights
   * @returns {Promise<Array>} List of insights
   */
  getInsights: async () => {
    const response = await apiClient.get('/analytics/insights');
    return response.data || [];
  }
};

export default analyticsService;
