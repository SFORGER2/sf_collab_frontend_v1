import axios from 'axios';
import {
  API_CONFIG,
  requestErrorInterceptor,
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor,
} from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ─────────────────────────────────────────────────────────────
// Vision API
// Wraps the backend's Vision system (readiness_routes.py + activation_routes.py).
// "Vision Points" in the product spec === "readiness_score" (0-100) on the Idea model.
// ─────────────────────────────────────────────────────────────
export const visionAPI = {
  // GET /ideas/:id/readiness — current Vision Points + breakdown + needs
  getReadiness: async (ideaId) => {
    const response = await api.get(`/ideas/${ideaId}/readiness`);
    return response.data;
  },

  // PUT /ideas/:id/vision-fields — update problem_statement, outcome_goal,
  // required_roles, roadmap_items, risk_level (feeds the readiness score)
  updateVisionFields: async (ideaId, fields) => {
    const response = await api.put(`/ideas/${ideaId}/vision-fields`, fields);
    return response.data;
  },

  // POST /ideas/:id/vision-state — manually move the vision through its lifecycle
  setVisionState: async (ideaId, visionState) => {
    const response = await api.post(`/ideas/${ideaId}/vision-state`, {
      vision_state: visionState,
    });
    return response.data;
  },

  // GET /activation/ideas/:id/eligibility — is this vision eligible to convert?
  getActivationEligibility: async (ideaId) => {
    const response = await api.get(`/activation/ideas/${ideaId}/eligibility`);
    return response.data;
  },

  // POST /activation/ideas/:id/activate — convert Vision -> Startup
  activateStartup: async (ideaId, startupName) => {
    const response = await api.post(`/activation/ideas/${ideaId}/activate`, {
      startup_name: startupName,
    });
    return response.data;
  },
};

export default visionAPI;