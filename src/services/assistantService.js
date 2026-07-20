// src/services/assistantService.js
// All responses use the envelope { success, data, error }.
import apiClient from './apiClient';

const BASE = '/api/assistant';

const unwrap = (res) => {
  const body = res.data;
  if (body && body.success === false) throw new Error(body.error || 'Assistant error');
  return body?.data ?? body;
};

const assistantService = {
  // ── health / usage ─────────────────────────────────────────────
  health: () => apiClient.get(`${BASE}/health`).then(unwrap),
  usage: () => apiClient.get(`${BASE}/usage`).then(unwrap),

  // ── conversational assistant ───────────────────────────────────
  /**
   * chat({ message, workspaceId?, conversationId?, execute? })
   * Response types:
   *   { type: "answer", answer, sources, confidence, conversation_id }
   *   { type: "action_proposed", action, params, description, hint, conversation_id }
   *   { type: "action_executed", action, params, result, description, conversation_id }
   */
  chat: ({ message, workspaceId, conversationId, execute = false }) =>
    apiClient.post(`${BASE}/chat`, {
      message,
      workspace_id: workspaceId ?? undefined,
      conversation_id: conversationId ?? undefined,
      execute,
    }).then(unwrap),

  ask: (question, workspaceId) =>
    apiClient.post(`${BASE}/ask`, {
      question,
      workspace_id: workspaceId ?? undefined,
    }).then(unwrap),

  listConversations: () => apiClient.get(`${BASE}/conversations`).then(unwrap),
  getConversationMessages: (conversationId) =>
    apiClient.get(`${BASE}/conversations/${conversationId}/messages`).then(unwrap),

  // ── knowledge base / documents ─────────────────────────────────
  /** Upload a file into the assistant's knowledge base. */
  ingestFile: (file, { workspaceId, scope, tags, folderName, documentType } = {}) => {
    const form = new FormData();
    form.append('file', file);
    if (workspaceId != null) form.append('workspace_id', workspaceId);
    if (scope) form.append('scope', scope); // user | workspace | central
    if (tags) form.append('tags', Array.isArray(tags) ? tags.join(',') : tags);
    if (folderName) form.append('folder_name', folderName);
    if (documentType) form.append('document_type', documentType);
    return apiClient.post(`${BASE}/documents/ingest`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(unwrap);
  },

  /** Ingest raw text (notes, pasted content). */
  ingestText: ({ title, text, workspaceId, scope, tags, folderName, documentType }) =>
    apiClient.post(`${BASE}/documents/ingest`, {
      title, text,
      workspace_id: workspaceId ?? undefined,
      scope, tags, folder_name: folderName, document_type: documentType,
    }).then(unwrap),

  /** Index the existing SF Drive files of a workspace. */
  syncDrive: (workspaceId) =>
    apiClient.post(`${BASE}/documents/sync-drive`, { workspace_id: workspaceId }).then(unwrap),

  listDocuments: ({ workspaceId, documentType, scope, limit } = {}) =>
    apiClient.get(`${BASE}/documents`, {
      params: {
        workspace_id: workspaceId ?? undefined,
        document_type: documentType ?? undefined,
        scope: scope ?? undefined,
        limit: limit ?? undefined,
      },
    }).then(unwrap),

  getDocument: (docId, includeText = false) =>
    apiClient.get(`${BASE}/documents/${docId}`, {
      params: includeText ? { include_text: 'true' } : {},
    }).then(unwrap),

  deleteDocument: (docId) =>
    apiClient.delete(`${BASE}/documents/${docId}`).then(unwrap),

  getDocumentVersions: (docId) =>
    apiClient.get(`${BASE}/documents/${docId}/versions`).then(unwrap),

  /** "What changed?" between versions (defaults to latest vs previous). */
  getDocumentChanges: (docId, fromVersion, toVersion) =>
    apiClient.get(`${BASE}/documents/${docId}/changes`, {
      params: {
        from: fromVersion ?? undefined,
        to: toVersion ?? undefined,
      },
    }).then(unwrap),

  // ── document writer ────────────────────────────────────────────
  /**
   * writeDocument({ topic, instructions?, documentType?, workspaceId?,
   *                 outputFormat?, saveToDrive?, title? })
   * documentType: business_plan | report | spec | meeting_summary |
   *               pitch_outline | roadmap | proposal | custom
   * outputFormat: markdown | docx | pdf
   * Returns { title, content, document_id, file_url, mime_type, drive_file, sources }
   */
  writeDocument: ({ topic, instructions, documentType = 'report', workspaceId,
                    outputFormat = 'markdown', saveToDrive = true, title }) =>
    apiClient.post(`${BASE}/write`, {
      topic, instructions,
      document_type: documentType,
      workspace_id: workspaceId ?? undefined,
      output_format: outputFormat,
      save_to_drive: saveToDrive,
      title: title ?? undefined,
    }).then(unwrap),

  // ── actions ────────────────────────────────────────────────────
  /**
   * executeAction('schedule_meeting', { title, when, workspace_id, duration_minutes })
   * executeAction('create_workspace', { name })
   * executeAction('create_task', { title, workspace_id, description?, deadline?, assigned_to? })
   * executeAction('create_reminder', { title, when })
   * executeAction('write_document', { topic, document_type?, workspace_id? })
   */
  executeAction: (action, params = {}) =>
    apiClient.post(`${BASE}/actions/execute`, { action, params }).then(unwrap),

  getActionHistory: () => apiClient.get(`${BASE}/actions`).then(unwrap),

  // ── workspace summaries ────────────────────────────────────────
  getWorkspaceSummary: (workspaceId) =>
    apiClient.get(`${BASE}/workspaces/${workspaceId}/summary`).then(unwrap),
  refreshWorkspaceSummary: (workspaceId) =>
    apiClient.post(`${BASE}/workspaces/${workspaceId}/summary/refresh`).then(unwrap),

  // ── developer watchdog (admin) ─────────────────────────────────
  runDevWatch: () => apiClient.post(`${BASE}/dev-watch/run`).then(unwrap),
  getDevWatchReports: (limit = 100) =>
    apiClient.get(`${BASE}/dev-watch/reports`, { params: { limit } }).then(unwrap),
};

export default assistantService;
