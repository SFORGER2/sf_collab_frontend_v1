import axios from 'axios'
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';
import * as MOCK from '../../components/pages/erp/data/erpMockData';

const api = axios.create(API_CONFIG)

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

/**
 * ERP API Service — Smart Simulation Layer
 * Automatically falls back to mock data if the backend is unavailable (Frontend-Only Mode).
 */
export const erpAPI = {
  
  // ─── EXECUTION DASHBOARD ──────────────────────────────────────────────────
  
  getExecutionMetrics: async (workspaceId, timeRange = 'week') => {
    try {
      const response = await api.get('/erp/execution/metrics', { params: { workspaceId, timeRange } });
      return response.data;
    } catch (e) {
      return { score: MOCK.INITIAL_EXECUTION_SCORE, metrics: MOCK.INITIAL_KPI_DATA, burn_rate: MOCK.INITIAL_BURN_RATE };
    }
  },

  getActivityFeed: async (workspaceId, filter = 'all') => {
    try {
      const response = await api.get('/erp/execution/activity', { params: { workspaceId, filter } });
      return response.data;
    } catch (e) {
      return MOCK.INITIAL_ACTIVITY;
    }
  },

  getLeaderboard: async (workspaceId) => {
    try {
      const response = await api.get('/erp/execution/leaderboard', { params: { workspaceId } });
      return response.data;
    } catch (e) {
      return MOCK.INITIAL_LEADERBOARD;
    }
  },

  // ─── TASK MANAGEMENT ──────────────────────────────────────────────────────

  getTasks: async (workspaceId) => {
    try {
      const response = await api.get('/erp/tasks', { params: { workspaceId } });
      return response.data;
    } catch (e) {
      return MOCK.INITIAL_TASKS;
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('/erp/tasks', taskData);
      return response.data;
    } catch (e) {
      return { ...taskData, id: Date.now(), status: 'todo' };
    }
  },

  updateTask: async (taskId, updateData) => {
    try {
      const response = await api.patch(`/erp/tasks/${taskId}`, updateData);
      return response.data;
    } catch (e) {
      return { id: taskId, ...updateData };
    }
  },

  submitProof: async (taskId, proofData) => {
    try {
      const response = await api.post(`/erp/tasks/${taskId}/proof`, proofData);
      return response.data;
    } catch (e) {
      return { success: true, message: "Proof submitted (Simulated)" };
    }
  },

  verifyProof: async (taskId, verificationData) => {
    try {
      const response = await api.post(`/erp/tasks/${taskId}/verify`, verificationData);
      return response.data;
    } catch (e) {
      return { success: true, message: "Proof verified (Simulated)" };
    }
  },

  // ─── WARNING DASHBOARD ────────────────────────────────────────────────────

  getWarnings: async (workspaceId) => {
    try {
      const response = await api.get('/erp/warnings', { params: { workspaceId } });
      return response.data;
    } catch (e) {
      return MOCK.WARNINGS_FULL;
    }
  },

  updateWarningStatus: async (warningId, status, notes = '') => {
    try {
      const response = await api.patch(`/erp/warnings/${warningId}`, { status, notes });
      return response.data;
    } catch (e) {
      return { id: warningId, status, notes };
    }
  },

  getWarningStats: async (workspaceId) => {
    try {
      const response = await api.get('/erp/warnings/stats', { params: { workspaceId } });
      return response.data;
    } catch (e) {
      return MOCK.WARNING_TREND_DATA;
    }
  },

  // ─── ADMIN & WORKSPACE SETTINGS ───────────────────────────────────────────

  getMembers: async (workspaceId) => {
    try {
      const response = await api.get('/erp/admin/members', { params: { workspaceId } });
      return response.data;
    } catch (e) {
      return MOCK.INITIAL_MEMBERS;
    }
  },

  inviteMember: async (workspaceId, email, role = 'Member') => {
    try {
      const response = await api.post('/erp/admin/invite', { workspaceId, email, role });
      return response.data;
    } catch (e) {
      return { success: true, email, role };
    }
  },

  getHolidays: async (workspaceId) => {
    try {
      const response = await api.get('/erp/admin/holidays', { params: { workspaceId } });
      return response.data;
    } catch (e) {
      return MOCK.INITIAL_HOLIDAYS;
    }
  },

  addHoliday: async (workspaceId, holidayData) => {
    try {
      const response = await api.post('/erp/admin/holidays', { workspaceId, ...holidayData });
      return response.data;
    } catch (e) {
      return { id: Date.now(), ...holidayData };
    }
  },

  updateWorkspaceSettings: async (workspaceId, settings) => {
    try {
      const response = await api.patch(`/erp/admin/settings/${workspaceId}`, settings);
      return response.data;
    } catch (e) {
      return { success: true, settings };
    }
  },

  // ─── ATTENDANCE & UPDATES ────────────────────────────────────────────────

  recordAttendance: async (workspaceId, type) => {
    try {
      const response = await api.post('/erp/attendance/record', { workspaceId, type });
      return response.data;
    } catch (e) {
      return { success: true, type, timestamp: new Date().toISOString() };
    }
  },

  getAttendanceHistory: async (workspaceId) => {
    try {
      const response = await api.get('/erp/attendance/history', { params: { workspaceId } });
      return response.data;
    } catch (e) {
      return []; // Fallback to empty history
    }
  },

  submitDailyUpdate: async (updateData) => {
    try {
      const response = await api.post('/erp/updates', updateData);
      return response.data;
    } catch (e) {
      return { success: true, ...updateData };
    }
  },

  getDailyUpdates: async (workspaceId, filter = 'all') => {
    try {
      const response = await api.get('/erp/updates', { params: { workspaceId, filter } });
      return response.data;
    } catch (e) {
      return []; 
    }
  }
}

export default erpAPI;
