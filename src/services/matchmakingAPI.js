/**
 * matchmakingAPI.js — Task 2 (Foundation)
 *
 * Fetches AI builder recommendations from the backend.
 * Endpoint: GET /api/matchmaking/vision/{vision_id}
 * Auth: injected automatically by apiClient interceptor (Bearer token).
 */

import apiClient from '@/services/apiClient';

export const matchmakingAPI = {
  /**
   * @param {number|string} visionId - startup/vision ID
   * @returns {Promise<Array>} matches array
   */
  getRecommendations: async (visionId) => {
    const response = await apiClient.get(`/matchmaking/vision/${visionId}`);
    return response.data?.data?.matches ?? [];
  },
};

export default matchmakingAPI;
