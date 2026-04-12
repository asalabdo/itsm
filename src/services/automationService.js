import apiClient from './apiClient';

/**
 * Service for Workflow Automation and Rule management
 */
const automationService = {
  /**
   * Get all automation rules
   * @returns {Promise<Array>} List of rules
   */
  getRules: async () => {
    const response = await apiClient.get('/automation/rules');
    return response.data;
  },

  /**
   * Create a new automation rule
   * @param {Object} data - Rule definition
   * @returns {Promise<Object>} The created rule
   */
  createRule: async (data) => {
    const response = await apiClient.post('/automation/rules', data);
    return response.data;
  },

  /**
   * Get execution logs for automation rules
   * @param {number} limit - Number of logs to fetch
   * @returns {Promise<Array>} List of execution records
   */
  getLogs: async (limit = 50) => {
    const response = await apiClient.get(`/automation/logs?limit=${limit}`);
    return response.data;
  }
};

export default automationService;
