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
// Investor Portal API — wraps app/routes/investor_portal_routes.py
// (prefix: /api/investor-portal). Uses the standard success_response
// wrapper, so one unwrap: res.data.data.X
// ─────────────────────────────────────────────────────────────
export const investorPortalAPI = {
  // ── Access grants ──
  listAccess: async (startupId) => {
    const res = await api.get(`/investor-portal/startups/${startupId}/access`);
    return res.data.data.grants;
  },

  grantAccess: async (startupId, grantData) => {
    // { investorEmail?, investorUserId?, investorName?, accessLevel? }
    const res = await api.post(`/investor-portal/startups/${startupId}/access`, grantData);
    return res.data.data.grant;
  },

  updateAccess: async (grantId, updates) => {
    const res = await api.patch(`/investor-portal/access/${grantId}`, updates);
    return res.data.data.grant;
  },

  revokeAccess: async (grantId) => {
    const res = await api.delete(`/investor-portal/access/${grantId}`);
    return res.data;
  },

  // ── Data room documents ──
  listDocuments: async (startupId) => {
    const res = await api.get(`/investor-portal/startups/${startupId}/documents`);
    return res.data.data.documents;
  },

  addDocument: async (startupId, docData) => {
    // { title, fileUrl, category?, visibility? }
    const res = await api.post(`/investor-portal/startups/${startupId}/documents`, docData);
    return res.data.data.document;
  },

  deleteDocument: async (documentId) => {
    const res = await api.delete(`/investor-portal/documents/${documentId}`);
    return res.data;
  },

  // ── Investor updates (broadcasts) ──
  listUpdates: async (startupId) => {
    const res = await api.get(`/investor-portal/startups/${startupId}/updates`);
    return res.data.data.updates;
  },

  createUpdate: async (startupId, updateData) => {
    // { title, body }
    const res = await api.post(`/investor-portal/startups/${startupId}/updates`, updateData);
    return res.data.data.update;
  },

  // ── Metrics snapshot ──
  getMetrics: async (startupId) => {
    const res = await api.get(`/investor-portal/startups/${startupId}/metrics`);
    return res.data.data;
  },
};

export default investorPortalAPI;
