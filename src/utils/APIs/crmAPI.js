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
// CRM API — wraps app/routes/crm_routes.py (prefix: /api/crm)
//
// These routes use the standard success_response({data: {...}}) wrapper,
// so responses need one unwrap: res.data.X (not res.data.data.X — the
// axios response.data IS the {success, data} body already).
// ─────────────────────────────────────────────────────────────
export const crmAPI = {
  // ── Contacts ──
  listContacts: async (startupId, { archived = false } = {}) => {
    const res = await api.get('/crm/contacts', { params: { startupId, archived } });
    return res.data.data.contacts;
  },

  createContact: async (contactData) => {
    // { startupId, name, email?, phone?, company?, title?, source?, notes? }
    const res = await api.post('/crm/contacts', contactData);
    return res.data.data.contact;
  },

  getContact: async (contactId) => {
    const res = await api.get(`/crm/contacts/${contactId}`);
    return res.data.data.contact;
  },

  updateContact: async (contactId, updates) => {
    const res = await api.patch(`/crm/contacts/${contactId}`, updates);
    return res.data.data.contact;
  },

  deleteContact: async (contactId) => {
    const res = await api.delete(`/crm/contacts/${contactId}`);
    return res.data;
  },

  // ── Deals ──
  listDeals: async (startupId, { stage } = {}) => {
    const res = await api.get('/crm/deals', { params: { startupId, stage } });
    return res.data.data.deals;
  },

  createDeal: async (dealData) => {
    // { startupId, title, contactId?, stage?, value?, currency?, notes?, expectedCloseDate? }
    const res = await api.post('/crm/deals', dealData);
    return res.data.data.deal;
  },

  updateDeal: async (dealId, updates) => {
    const res = await api.patch(`/crm/deals/${dealId}`, updates);
    return res.data.data.deal;
  },

  deleteDeal: async (dealId) => {
    const res = await api.delete(`/crm/deals/${dealId}`);
    return res.data;
  },

  // ── Pipeline ──
  getPipelineBoard: async (startupId) => {
    const res = await api.get(`/crm/startups/${startupId}/pipeline`);
    return res.data.data; // { board: {...}, totalValue: {...} }
  },
};

export default crmAPI;
