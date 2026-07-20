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
// Automation API — wraps app/routes/automation_routes.py
// (prefix: /api/automation). Uses the standard success_response
// wrapper, so one unwrap: res.data.data.X
// ─────────────────────────────────────────────────────────────
export const automationAPI = {
  listRules: async (startupId) => {
    const res = await api.get(`/automation/startups/${startupId}/rules`);
    return res.data.data.rules;
  },

  createRule: async (startupId, ruleData) => {
    // { name, triggerType, actionType, condition?, actionConfig?, isActive? }
    const res = await api.post(`/automation/startups/${startupId}/rules`, ruleData);
    return res.data.data.rule;
  },

  updateRule: async (ruleId, updates) => {
    const res = await api.patch(`/automation/rules/${ruleId}`, updates);
    return res.data.data.rule;
  },

  deleteRule: async (ruleId) => {
    const res = await api.delete(`/automation/rules/${ruleId}`);
    return res.data;
  },

  listLogs: async (ruleId) => {
    const res = await api.get(`/automation/rules/${ruleId}/logs`);
    return res.data.data.logs;
  },

  testRule: async (ruleId) => {
    const res = await api.post(`/automation/rules/${ruleId}/test`);
    return res.data.data; // { log, rule }
  },
};

export default automationAPI;
