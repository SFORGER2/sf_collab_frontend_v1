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
// Recruitment / Hiring API
// Wraps app/routes/recruitment_routes.py (prefix: /api/recruitment)
//
// IMPORTANT: unlike most of the app, these routes return raw jsonify()
// bodies, NOT the success_response({data: {...}}) wrapper. So responses
// here are used directly — no res.data.data double-unwrap.
// ─────────────────────────────────────────────────────────────
export const recruitmentAPI = {
  // GET /recruitment/dashboard
  getDashboard: async () => {
    const response = await api.get('/recruitment/dashboard');
    return response.data;
  },

  // ── Jobs ──
  listJobs: async ({ startupId, isOpen = true } = {}) => {
    const response = await api.get('/recruitment/jobs', {
      params: { startupId, isOpen },
    });
    return response.data; // array of jobs
  },

  createJob: async (jobData) => {
    // jobData: { startupId, title, description?, department?, location?, isRemote? }
    const response = await api.post('/recruitment/jobs', jobData);
    return response.data;
  },

  getJob: async (jobId) => {
    const response = await api.get(`/recruitment/jobs/${jobId}`);
    return response.data;
  },

  updateJob: async (jobId, updates) => {
    const response = await api.patch(`/recruitment/jobs/${jobId}`, updates);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`/recruitment/jobs/${jobId}`);
    return response.data;
  },

  // ── Applicants ──
  listApplicants: async (jobId, { stage, archived = false } = {}) => {
    const response = await api.get(`/recruitment/jobs/${jobId}/applicants`, {
      params: { stage, archived },
    });
    return response.data; // array of applicants
  },

  addApplicant: async (jobId, applicantData) => {
    // applicantData: { name, email?, phone?, resumeUrl?, linkedin?, portfolio?, notes?, stage?, score? }
    const response = await api.post(`/recruitment/jobs/${jobId}/applicants`, applicantData);
    return response.data;
  },

  getApplicant: async (applicantId) => {
    const response = await api.get(`/recruitment/applicants/${applicantId}`);
    return response.data;
  },

  updateApplicant: async (applicantId, updates) => {
    const response = await api.patch(`/recruitment/applicants/${applicantId}`, updates);
    return response.data;
  },

  deleteApplicant: async (applicantId) => {
    const response = await api.delete(`/recruitment/applicants/${applicantId}`);
    return response.data;
  },

  // ── Pipeline ──
  moveStage: async (applicantId, stage, reason) => {
    const response = await api.patch(`/recruitment/applicants/${applicantId}/stage`, {
      stage,
      reason,
    });
    return response.data; // { applicant, stageHistory }
  },

  getStageHistory: async (applicantId) => {
    const response = await api.get(`/recruitment/applicants/${applicantId}/stage-history`);
    return response.data;
  },

  getPipelineBoard: async (jobId) => {
    const response = await api.get(`/recruitment/jobs/${jobId}/pipeline`);
    return response.data; // { sourced: [...], contacted: [...], ... }
  },

  // ── Outreach ──
  listOutreach: async (applicantId) => {
    const response = await api.get(`/recruitment/applicants/${applicantId}/outreach`);
    return response.data;
  },

  logOutreach: async (applicantId, outreachData) => {
    // outreachData: { channel?, status?, subject?, body?, templateUsed?, followUpAt? }
    const response = await api.post(`/recruitment/applicants/${applicantId}/outreach`, outreachData);
    return response.data;
  },

  updateOutreach: async (logId, updates) => {
    const response = await api.patch(`/recruitment/outreach/${logId}`, updates);
    return response.data;
  },

  // ── Referrals ──
  listReferrals: async (jobId) => {
    const response = await api.get(`/recruitment/jobs/${jobId}/referrals`);
    return response.data;
  },

  createReferral: async (jobId, referralData) => {
    // referralData: { candidateName, candidateEmail?, candidateLinkedin?, note?, applicantId? }
    const response = await api.post(`/recruitment/jobs/${jobId}/referrals`, referralData);
    return response.data;
  },

  updateReferral: async (referralId, updates) => {
    const response = await api.patch(`/recruitment/referrals/${referralId}`, updates);
    return response.data;
  },
};

export default recruitmentAPI;
