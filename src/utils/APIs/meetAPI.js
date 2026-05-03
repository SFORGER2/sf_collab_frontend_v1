// src/utils/APIs/meetAPI.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("access_token") ||
    (() => { try { return JSON.parse(localStorage.getItem("persist:auth") || "{}").access_token?.replace(/"/g, ""); } catch { return null; } })();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

const api = axios.create({ baseURL: `${BASE_URL}/api/meet` });
api.interceptors.request.use(cfg => { cfg.headers = { ...cfg.headers, ...getHeaders() }; return cfg; });

export const meetAPI = {
  // ── Meetings ──────────────────────────────────────────────────────────────
  listMeetings:      (params = {}) => api.get("/", { params }),
  getMeeting:        (id) => api.get(`/${id}`),
  createMeeting:     (data) => api.post("/", data),
  updateMeeting:     (id, data) => api.put(`/${id}`, data),
  cancelMeeting:     (id) => api.post(`/${id}/cancel`),
  startMeeting:      (id) => api.post(`/${id}/start`),
  endMeeting:        (id) => api.post(`/${id}/end`),
  archiveMeeting:    (id) => api.post(`/${id}/archive`),
  searchMeetings:    (params) => api.get("/search", { params }),

  // ── Participants ───────────────────────────────────────────────────────────
  getParticipants:   (id) => api.get(`/${id}/participants`),
  inviteParticipant: (id, data) => api.post(`/${id}/participants`, data),
  removeParticipant: (id, pid) => api.delete(`/${id}/participants/${pid}`),
  joinMeeting:       (id) => api.post(`/${id}/join`),
  leaveMeeting:      (id) => api.post(`/${id}/leave`),

  // ── Room + Recording ───────────────────────────────────────────────────────
  createRoom:        (id) => api.post(`/${id}/room/create`),
  getJoinToken:      (id, data = {}) => api.post(`/${id}/room/join-token`, data),
  processRecording:  (id) => api.post(`/${id}/recording/process`),
  getRecordingStatus:(id) => api.get(`/${id}/recording/status`),
  uploadTranscript:  (id, data) => api.post(`/${id}/recording/transcript`, data),

  // ── Artifacts ─────────────────────────────────────────────────────────────
  getArtifacts:      (id) => api.get(`/${id}/artifacts`),
  saveArtifact:      (id, data) => api.post(`/${id}/artifacts`, data),

  // ── Decisions ─────────────────────────────────────────────────────────────
  getDecisions:      (id) => api.get(`/${id}/decisions`),
  createDecision:    (id, data) => api.post(`/${id}/decisions`, data),
  updateDecision:    (id, did, data) => api.put(`/${id}/decisions/${did}`, data),

  // ── Action Items ──────────────────────────────────────────────────────────
  getActionItems:    (id) => api.get(`/${id}/action-items`),
  createActionItem:  (id, data) => api.post(`/${id}/action-items`, data),
  updateActionItem:  (id, iid, data) => api.put(`/${id}/action-items/${iid}`, data),

  // ── Annotations ───────────────────────────────────────────────────────────
  getAnnotations:    (id) => api.get(`/${id}/annotations`),
  createAnnotation:  (id, data) => api.post(`/${id}/annotations`, data),
  exportAnnotations: (id) => api.get(`/${id}/annotations/export`),

  // ── Files ─────────────────────────────────────────────────────────────────
  getFiles:          (id) => api.get(`/${id}/files`),
  attachFile:        (id, data) => api.post(`/${id}/files/attach`, data),
  openFile:          (id, fid) => api.post(`/${id}/files/${fid}/open`),
  detachFile:        (id, fid) => api.delete(`/${id}/files/${fid}`),

  // ── Milestones ────────────────────────────────────────────────────────────
  linkMilestones:    (id, data) => api.post(`/${id}/milestones/link`, data),
  updateMilestoneNotes: (id, mid, data) => api.post(`/${id}/milestones/${mid}/update-notes`, data),

  // ── Pre-meeting ───────────────────────────────────────────────────────────
  getPreMeetingPanel:(id) => api.get(`/${id}/pre-meeting`),
  getProcessPipeline:(id) => api.post(`/${id}/process`),

  // ── Post-meeting / Memory ─────────────────────────────────────────────────
  triggerMemoryUpdate: (id) => api.post(`/${id}/memory/update`),
  getMeetingMemory:    (id) => api.get(`/${id}/memory`),

  // ── Startup overview ──────────────────────────────────────────────────────
  getStartupOverview:(startupId) => api.get(`/startup/${startupId}/overview`),

  // ── Templates ─────────────────────────────────────────────────────────────
  getTemplates:      () => api.get("/templates"),
  getTemplate:       (type) => api.get(`/templates/${type}`),

  // ── Guests ────────────────────────────────────────────────────────────────
  inviteGuest:       (id, data) => api.post(`/${id}/guests/invite`, data),
  getWaitingGuests:  (id) => api.get(`/${id}/guests/waiting`),
  admitGuest:        (id, token) => api.post(`/${id}/guests/${token}/admit`),
  generateFollowUp:  (id, data) => api.post(`/${id}/guests/follow-up`, data),
};