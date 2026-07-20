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
// Startup Workspace API
// Wraps the backend's Execution/Lifecycle/Crowdfunding endpoints
// (readiness_routes.py) that power the "Startup Scoring" module and
// the workspace dashboard's health widgets.
// ─────────────────────────────────────────────────────────────
export const startupWorkspaceAPI = {
  // GET /startups/:id/execution-score
  getExecutionScore: async (startupId) => {
    const response = await api.get(`/startups/${startupId}/execution-score`);
    return response.data;
  },

  // POST /startups/:id/lifecycle-state
  setLifecycleState: async (startupId, lifecycleState) => {
    const response = await api.post(`/startups/${startupId}/lifecycle-state`, {
      lifecycle_state: lifecycleState,
    });
    return response.data;
  },

  // POST /startups/:id/record-activity
  recordActivity: async (startupId) => {
    const response = await api.post(`/startups/${startupId}/record-activity`);
    return response.data;
  },

  // POST /startups/:id/complete-milestone
  completeMilestone: async (startupId, milestoneTitle, totalMilestones) => {
    const response = await api.post(`/startups/${startupId}/complete-milestone`, {
      milestone_title: milestoneTitle,
      total_milestones: totalMilestones,
    });
    return response.data;
  },

  // GET /startups/:id/crowdfunding-eligibility
  getCrowdfundingEligibility: async (startupId) => {
    const response = await api.get(`/startups/${startupId}/crowdfunding-eligibility`);
    return response.data;
  },

  // POST /startups/:id/unlock-crowdfunding
  unlockCrowdfunding: async (startupId) => {
    const response = await api.post(`/startups/${startupId}/unlock-crowdfunding`);
    return response.data;
  },

  // GET /matchmaking/startups/:startupId/candidates
  getCandidates: async (startupId) => {
    const response = await api.get(`/matchmaking/startups/${startupId}/candidates`);
    return response.data;
  },

  getMentors: async (startupId) => {
     const response = await api.get(`/matchmaking/startups/${startupId}/mentors`);
     return response.data;
  },
  getInvestors: async (startupId) => {
    const response = await api.get(`/matchmaking/startups/${startupId}/investors`);
    return response.data;
  },

};
export default startupWorkspaceAPI;