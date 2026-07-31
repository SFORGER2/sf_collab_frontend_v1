import api from './interceptors';

export const evaluationAPI = {
  /**
   * Triggers evaluation on the backend for a given classifier version.
   * POST /api/evaluate
   */
  runEvaluation: async (modelVersion) => {
    const response = await api.post('/evaluate', { model_version: modelVersion });
    return response.data;
  },

  /**
   * Retrieves all historical evaluation runs from the persistent store.
   * GET /api/evaluations
   */
  getEvaluationHistory: async () => {
    const response = await api.get('/evaluations');
    return response.data;
  },

  /**
   * Retrieves the most recent evaluation run.
   * GET /api/evaluations/latest
   */
  getLatestEvaluation: async () => {
    const response = await api.get('/evaluations/latest');
    return response.data;
  }
};
