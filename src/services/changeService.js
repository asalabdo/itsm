import apiClient from './apiClient';

/**
 * Service for Change Management operations
 */
const changeService = {
  requestWithVersionFallback: async (path, options = {}) => {
    try {
      const response = await apiClient.request({ url: path, ...options });
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        const fallbackResponse = await apiClient.request({ url: `/v1${path}`, ...options });
        return fallbackResponse.data;
      }
      throw error;
    }
  },
  /**
   * Get all change requests
   * @returns {Promise<Array>} List of change requests
   */
  getAll: async () => {
    return changeService.requestWithVersionFallback('/changerequests');
  },

  /**
   * Get a change request by ID
   * @param {number} id - Change request ID
   * @returns {Promise<Object>} The change request data
   */
  getById: async (id) => {
    return changeService.requestWithVersionFallback(`/changerequests/${id}`);
  },

  /**
   * Create a new change request
   * @param {Object} data - Change request data
   * @returns {Promise<Object>} The created change request
   */
  create: async (data) => {
    return changeService.requestWithVersionFallback('/changerequests', { method: 'post', data });
  },

  /**
   * Update an existing change request
   * @param {number} id - Change request ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} The updated change request
   */
  update: async (id, data) => {
    return changeService.requestWithVersionFallback(`/changerequests/${id}`, { method: 'put', data });
  },

  /**
   * Submit a change request for approval
   * @param {number} id - Change request ID
   * @returns {Promise<Object>} The updated change request
   */
  submit: async (id) => {
    return changeService.requestWithVersionFallback(`/changerequests/${id}/submit`, { method: 'post' });
  },

  /**
   * Approve a change request
   * @param {number} id - Change request ID
   * @param {string} notes - Approval notes
   * @returns {Promise<Object>} The updated change request
   */
  approve: async (id, notes = '') => {
    return changeService.requestWithVersionFallback(`/changerequests/${id}/approve`, { method: 'post', data: { notes } });
  },

  /**
   * Reject a change request
   * @param {number} id - Change request ID
   * @param {string} notes - Rejection notes
   * @returns {Promise<Object>} The updated change request
   */
  reject: async (id, notes = '') => {
    return changeService.requestWithVersionFallback(`/changerequests/${id}/reject`, { method: 'post', data: { notes } });
  },

  /**
   * Get change requests by status
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} Filtered list of change requests
   */
  getByStatus: async (status) => {
    return changeService.requestWithVersionFallback(`/changerequests/status/${status}`);
  }
};

export default changeService;
