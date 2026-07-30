/**
 * meetAPI.js — SF Collab Meeting API service
 * Backend: /api/meet  (meet_routes.py, meet_file_routes.py, meet_recording_routes.py)
 * Socket events: meet_join, meet_leave, meet_heartbeat, meet_notes_change, meet_annotate
 */

import axios from 'axios';
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from '@/utils/APIs/interceptors';

const api = axios.create({ baseURL: '/api/meet' });
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

const unwrap = (res) => res.data?.data ?? res.data;
const norm = (m) => m ? { ...m, status: m.status || 'scheduled' } : null;

// ── Meetings ───────────────────────────────────────────────────────────────
const listMeetings = async (params = {}) => {
  const res = await api.get('/', { params });
  const raw = unwrap(res);
  const list = Array.isArray(raw) ? raw : raw?.meetings || [];
  return { data: list.map(norm) };
};

const getMeeting = async (id) => {
  const res = await api.get(`/${id}`);
  return { data: norm(unwrap(res)) };
};

const createMeeting = async (form) => {
  const res = await api.post('/', {
    title: form.title,
    meeting_type: form.meeting_type || 'startup_team',
    scheduled_start_at: form.scheduled_start_at,
    scheduled_end_at: form.scheduled_end_at || null,
    startup_id: form.startup_id || null,
    linked_milestone_ids: form.linked_milestone_ids || [],
    timezone: form.timezone || 'UTC',
    visibility_scope: form.visibility_scope || 'invited_only',
    recording_enabled: form.recording_enabled || false,
    transcription_enabled: form.transcription_enabled || false,
    live_notes_enabled: form.live_notes_enabled !== false,
    annotation_enabled: form.annotation_enabled || false,
  });
  const data = unwrap(res);
  return { data: { meeting: norm(data?.meeting || data) } };
};

const updateMeeting = async (id, updates) => {
  const res = await api.put(`/${id}`, updates);
  return { data: unwrap(res) };
};

const startMeeting = async (id) => {
  try {
    const res = await api.post(`/${id}/start`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const endMeeting = async (id) => {
  const res = await api.post(`/${id}/end`);
  return { data: unwrap(res) };
};

const joinMeeting = async (id) => {
  try {
    const res = await api.post(`/${id}/join`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const leaveMeeting = async (id) => {
  try {
    const res = await api.post(`/${id}/leave`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const inviteParticipant = async (id, payload) => {
  try {
    const res = await api.post(`/${id}/participants`, payload);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const listParticipants = async (id) => {
  try {
    const res = await api.get(`/${id}/participants`);
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

// ── Decisions ──────────────────────────────────────────────────────────────
const getDecisions = async (id) => {
  try {
    const res = await api.get(`/${id}/decisions`);
    const raw = unwrap(res);
    return { data: { decisions: Array.isArray(raw) ? raw : raw?.decisions || [] } };
  } catch {
    return { data: { decisions: [] } };
  }
};

const createDecision = async (id, payload) => {
  try {
    const res = await api.post(`/${id}/decisions`, payload);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const updateDecision = async (id, decId, updates) => {
  try {
    const res = await api.put(`/${id}/decisions/${decId}`, updates);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

// ── Action Items ───────────────────────────────────────────────────────────
const getActionItems = async (id) => {
  try {
    const res = await api.get(`/${id}/action-items`);
    const raw = unwrap(res);
    return { data: { action_items: Array.isArray(raw) ? raw : raw?.action_items || [] } };
  } catch {
    return { data: { action_items: [] } };
  }
};

const createActionItem = async (id, payload) => {
  try {
    const res = await api.post(`/${id}/action-items`, payload);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const updateActionItem = async (id, itemId, updates) => {
  try {
    const res = await api.put(`/${id}/action-items/${itemId}`, updates);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

// ── Artifacts ──────────────────────────────────────────────────────────────
const saveArtifact = async (id, payload) => {
  try {
    const res = await api.post(`/${id}/artifacts`, payload);
    return { data: unwrap(res) };
  } catch {
    return { data: { message: 'Saved (stub)' } };
  }
};

// ── Annotations ────────────────────────────────────────────────────────────
const createAnnotation = async (id, payload) => {
  try {
    const res = await api.post(`/${id}/annotations`, {
      annotation_type: payload.annotation_type,
      payload: payload.payload || {},
      target_artifact_id: payload.target_artifact_id || null,
    });
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

// ── Files ──────────────────────────────────────────────────────────────────
const getFiles = async (id) => {
  try {
    const res = await api.get(`/${id}/files`);
    const raw = unwrap(res);
    return { data: Array.isArray(raw) ? raw : raw?.files || [] };
  } catch {
    return { data: [] };
  }
};

const attachFile = async (id, payload) => {
  try {
    const res = await api.post(`/${id}/files/attach`, payload);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const detachFile = async (id, artifactId) => {
  try {
    const res = await api.delete(`/${id}/files/${artifactId}`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const openFile = async (id, artifactId) => {
  try {
    const res = await api.post(`/${id}/files/${artifactId}/open`);
    const data = unwrap(res);
    if (data?.drive_file_id && !data.drive_file_id.startsWith('local:')) {
      window.open(data.drive_file_id, '_blank');
    }
    return { data };
  } catch {
    return { data: null };
  }
};

// ── AI / Memory ────────────────────────────────────────────────────────────
const getMeetingMemory = async (id) => {
  try {
    const res = await api.get(`/${id}/memory`);
    return { data: unwrap(res) };
  } catch {
    return { data: { memories: [] } };
  }
};

const getProcessPipeline = async (id) => {
  try {
    const res = await api.post(`/${id}/process`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const triggerMemoryUpdate = async (id) => {
  try {
    const res = await api.post(`/${id}/memory/update`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const getPreMeeting = async (id) => {
  try {
    const res = await api.get(`/${id}/pre-meeting`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

// ── Room / Recording ───────────────────────────────────────────────────────
const createRoom = async (id) => {
  try {
    const res = await api.post(`/${id}/room/create`);
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

const getJoinToken = async (id, displayName) => {
  try {
    const res = await api.post(`/${id}/room/join-token`, { display_name: displayName });
    return { data: unwrap(res) };
  } catch {
    return { data: null };
  }
};

// ── NEW: Upcoming, Past, Recordings ──────────────────────────────────────
const getUpcoming = async () => {
  try {
    const res = await api.get('/upcoming');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getPast = async () => {
  try {
    const res = await api.get('/past');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getRecordings = async () => {
  try {
    const res = await api.get('/recordings');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

// Sub‑resource aggregates
const getUpcomingFiles = async () => {
  try {
    const res = await api.get('/upcoming/files');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getUpcomingDecisions = async () => {
  try {
    const res = await api.get('/upcoming/decisions');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getUpcomingActionItems = async () => {
  try {
    const res = await api.get('/upcoming/action-items');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getPastFiles = async () => {
  try {
    const res = await api.get('/past/files');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getPastDecisions = async () => {
  try {
    const res = await api.get('/past/decisions');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getPastActionItems = async () => {
  try {
    const res = await api.get('/past/action-items');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getRecordingFiles = async () => {
  try {
    const res = await api.get('/recordings/files');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getRecordingDecisions = async () => {
  try {
    const res = await api.get('/recordings/decisions');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

const getRecordingActionItems = async () => {
  try {
    const res = await api.get('/recordings/action-items');
    return { data: unwrap(res) };
  } catch {
    return { data: [] };
  }
};

// ── Export ─────────────────────────────────────────────────────────────────
export const meetAPI = {
  listMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  startMeeting,
  endMeeting,
  joinMeeting,
  leaveMeeting,
  inviteParticipant,
  listParticipants,
  getDecisions,
  createDecision,
  updateDecision,
  getActionItems,
  createActionItem,
  updateActionItem,
  saveArtifact,
  createAnnotation,
  getFiles,
  attachFile,
  detachFile,
  openFile,
  getMeetingMemory,
  getProcessPipeline,
  triggerMemoryUpdate,
  getPreMeeting,
  createRoom,
  getJoinToken,
  // Newly added
  getUpcoming,
  getPast,
  getRecordings,
  getUpcomingFiles,
  getUpcomingDecisions,
  getUpcomingActionItems,
  getPastFiles,
  getPastDecisions,
  getPastActionItems,
  getRecordingFiles,
  getRecordingDecisions,
  getRecordingActionItems,
};

export default meetAPI;