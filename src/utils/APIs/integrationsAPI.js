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
// Integrations API — wraps app/routes/integrations_routes.py
// (prefix: /api/integrations). Uses the standard success_response
// wrapper, so one unwrap: res.data.data.X
//
// NOTE: connect() records a connection exists — it does not perform a
// real OAuth handshake with the provider. See routes file comments.
// ─────────────────────────────────────────────────────────────
export const integrationsAPI = {
  listConnections: async (startupId) => {
    const res = await api.get(`/integrations/startups/${startupId}/connections`);
    return res.data.data.connections;
  },

  connect: async (startupId, provider, config = {}) => {
    const res = await api.post(`/integrations/startups/${startupId}/connections`, {
      provider,
      config,
    });
    return res.data.data.connection;
  },

  updateConnection: async (connectionId, updates) => {
    const res = await api.patch(`/integrations/connections/${connectionId}`, updates);
    return res.data.data.connection;
  },

  disconnect: async (connectionId) => {
    const res = await api.delete(`/integrations/connections/${connectionId}`);
    return res.data.data.connection;
  },
};

export default integrationsAPI;
