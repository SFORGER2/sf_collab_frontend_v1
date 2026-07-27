// src/services/assistantService.js
// SF Assistant v2 — full API wrapper
// Integration guide: /api/assistant/*
// Response envelope: { success, data, error }
// Auth: Bearer token auto-attached by apiClient interceptor

import apiClient from './apiClient';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Unwrap the standard { success, data, error } envelope */
async function callAPI(requestFn) {
  try {
    const res = await requestFn();
    const body = res.data;
    if (!body.success) {
      throw new APIError(body.error || 'Request failed', res.status);
    }
    return body.data;
  } catch (err) {
    if (err instanceof APIError) throw err;
    const status = err?.response?.status;
    const message = err?.response?.data?.error || err.message || 'Unknown error';
    throw new APIError(message, status);
  }
}

export class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    /** Whether this is a rate-limit or upstream unavailable error */
    this.isBusy = status === 429 || status === 502 || status === 503;
  }
}

// ─── 3. Conversational Assistant ─────────────────────────────────────────────

/**
 * POST /api/assistant/chat
 * One endpoint drives the whole chat UX. Backend classifies intent.
 *
 * @param {{ message: string, workspaceId?: number, conversationId?: number, execute?: boolean }} opts
 * @returns {{ type: 'answer'|'action_proposed'|'action_executed', answer?, confidence?, sources?, action?, params?, description?, hint?, result?, conversation_id: number }}
 */
export async function chat({ message, workspaceId, conversationId, execute = false }) {
  if (import.meta.env.DEV) {
    const cleanMsg = message.trim().toLowerCase();
    if (cleanMsg === 'action_proposed' || cleanMsg === 'action_proposes' || cleanMsg.includes('propose')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            type: 'action_proposed',
            conversation_id: conversationId ?? 12345,
            description: 'AI proposes to create a new shared workspace "Collaborative Project" with default parameters.',
            action: 'create_workspace',
            params: {
              name: 'Collaborative Project',
              description: 'Created by SF Assistant',
            },
            hint: 'This action requires your confirmation before proceeding.',
          });
        }, 800);
      });
    }

    if (execute || cleanMsg === 'confirm' || cleanMsg === 'execute') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            type: 'action_executed',
            conversation_id: conversationId ?? 12345,
            result: 'Workspace "Collaborative Project" has been created successfully.',
            description: 'Action execution succeeded.',
          });
        }, 1500);
      });
    }

    if (cleanMsg === 'hello' || cleanMsg === 'hi') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            type: 'answer',
            conversation_id: conversationId ?? 12345,
            answer: 'Hello! I am your SF Assistant. How can I help you today? You can test my action confirmation flows by typing "action_proposed".',
          });
        }, 600);
      });
    }
  }

  return callAPI(() =>
    apiClient.post('/assistant/chat', {
      message,
      workspace_id: workspaceId ?? undefined,
      conversation_id: conversationId ?? undefined,
      execute,
    })
  );
}

/**
 * POST /api/assistant/ask
 * Pure grounded Q&A (no actions).
 *
 * @param {string} question
 * @param {number?} workspaceId
 * @returns {{ answer: string, sources: Array<{document_id, title, score}>, confidence: 'high'|'medium'|'low' }}
 */
export async function ask(question, workspaceId) {
  return callAPI(() =>
    apiClient.post('/assistant/ask', {
      question,
      workspace_id: workspaceId ?? undefined,
    })
  );
}

/**
 * GET /api/assistant/conversations
 * Conversation list (max 50, newest first).
 */
export async function getConversations() {
  return callAPI(() => apiClient.get('/api/assistant/conversations'));
}

/**
 * GET /api/assistant/conversations/:id/messages
 * Full message history for restoring chat threads.
 */
export async function getConversationMessages(conversationId) {
  return callAPI(() =>
    apiClient.get(`/api/assistant/conversations/${conversationId}/messages`)
  );
}

// ─── 4. Knowledge Base ───────────────────────────────────────────────────────

/**
 * POST /api/assistant/documents/ingest (multipart/form-data)
 * Accepts: pdf, docx, pptx, xlsx, csv, txt, md, html, json
 *
 * @param {File} file
 * @param {{ workspaceId?, scope?, tags?, folderName?, documentType?, sensitivity? }} meta
 * @returns ingest result data
 */
export async function ingestFile(file, meta = {}) {
  const form = new FormData();
  form.append('file', file);
  if (meta.workspaceId) form.append('workspace_id', meta.workspaceId);
  if (meta.scope) form.append('scope', meta.scope);
  if (meta.tags) form.append('tags', Array.isArray(meta.tags) ? meta.tags.join(',') : meta.tags);
  if (meta.folderName) form.append('folder_name', meta.folderName);
  if (meta.documentType) form.append('document_type', meta.documentType);
  if (meta.sensitivity) form.append('sensitivity', meta.sensitivity);

  return callAPI(() =>
    apiClient.post('/assistant/documents/ingest', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: meta.onProgress
        ? (e) => {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          meta.onProgress(pct);
        }
        : undefined,
    })
  );
}

/**
 * POST /api/assistant/documents/ingest (JSON)
 * Ingest raw text with a title.
 *
 * @param {string} title
 * @param {string} text
 * @param {{ workspaceId?, scope?, tags?, folderName?, documentType?, sensitivity? }} meta
 */
export async function ingestText(title, text, meta = {}) {
  return callAPI(() =>
    apiClient.post('/assistant/documents/ingest', {
      title,
      text,
      workspace_id: meta.workspaceId ?? undefined,
      scope: meta.scope ?? undefined,
      tags: Array.isArray(meta.tags) ? meta.tags.join(',') : meta.tags,
      folder_name: meta.folderName ?? undefined,
      document_type: meta.documentType ?? undefined,
      sensitivity: meta.sensitivity ?? undefined,
    })
  );
}

/**
 * POST /api/assistant/documents/sync-drive
 * Indexes the workspace's existing SF Drive files into the assistant.
 *
 * @param {number} workspaceId
 * @returns {{ scanned: number, ingested: number, updated: number, skipped: number, failed: number }}
 */
export async function syncDrive(workspaceId) {
  return callAPI(() =>
    apiClient.post('/assistant/documents/sync-drive', { workspace_id: workspaceId })
  );
}

/**
 * GET /api/assistant/documents
 * Permission-filtered list, newest first.
 *
 * @param {{ workspaceId?, scope?, documentType?, limit? }} filters
 */
export async function listDocuments(filters = {}) {
  return callAPI(() =>
    apiClient.get('/api/assistant/documents', {
      params: {
        workspace_id: filters.workspaceId ?? undefined,
        scope: filters.scope ?? undefined,
        document_type: filters.documentType ?? undefined,
        limit: filters.limit ?? undefined,
      },
    })
  );
}

/**
 * GET /api/assistant/documents/:id
 * Full metadata; include_text adds extracted text.
 */
export async function getDocument(id, includeText = false) {
  return callAPI(() =>
    apiClient.get(`/api/assistant/documents/${id}`, {
      params: { include_text: includeText },
    })
  );
}

/**
 * DELETE /api/assistant/documents/:id
 * Owner or admin only; also removes vectors.
 */
export async function deleteDocument(id) {
  return callAPI(() => apiClient.delete(`/api/assistant/documents/${id}`));
}

/**
 * GET /api/assistant/documents/:id/versions
 * All versions with per-version change summaries.
 */
export async function getDocumentVersions(id) {
  return callAPI(() => apiClient.get(`/api/assistant/documents/${id}/versions`));
}

/**
 * GET /api/assistant/documents/:id/changes
 * Defaults to latest vs previous.
 *
 * @returns {{ change_summary: string, diff_stats: { added_lines, removed_lines, similarity, samples[] } }}
 */
export async function getDocumentChanges(id, from, to) {
  return callAPI(() =>
    apiClient.get(`/api/assistant/documents/${id}/changes`, {
      params: {
        from: from ?? undefined,
        to: to ?? undefined,
      },
    })
  );
}

// ─── 5. Document Writer ───────────────────────────────────────────────────────

/**
 * POST /api/assistant/write
 * Generate a document grounded in workspace content.
 *
 * @param {{ topic, instructions?, documentType?, workspaceId?, outputFormat?, saveToDrive?, title? }} opts
 * documentType: business_plan | report | spec | meeting_summary | pitch_outline | roadmap | proposal | custom
 * outputFormat: markdown | docx | pdf
 * @returns {{ title, content, document_id, file_url, mime_type, drive_file, sources }}
 */
export async function writeDocument({
  topic,
  instructions,
  documentType,
  workspaceId,
  outputFormat = 'markdown',
  saveToDrive = false,
  title,
}) {
  return callAPI(() =>
    apiClient.post('/assistant/write', {
      topic,
      instructions: instructions ?? undefined,
      document_type: documentType ?? undefined,
      workspace_id: workspaceId ?? undefined,
      output_format: outputFormat,
      save_to_drive: saveToDrive,
      title: title ?? undefined,
    })
  );
}

// ─── 6. Direct Actions ────────────────────────────────────────────────────────

/**
 * POST /api/assistant/actions/execute
 * For explicit UI buttons (skip chat).
 *
 * Supported actions: create_workspace | schedule_meeting | create_task | create_reminder | write_document
 * @param {string} action
 * @param {object} params
 */
export async function executeAction(action, params) {
  return callAPI(() =>
    apiClient.post('/assistant/actions/execute', { action, params })
  );
}

/**
 * GET /api/assistant/actions
 * User's audited action history.
 * Status: proposed | executed | failed | denied
 */
export async function getActionHistory() {
  return callAPI(() => apiClient.get('/api/assistant/actions'));
}

// ─── 7. Workspace Summaries ───────────────────────────────────────────────────

/**
 * GET /api/assistant/workspaces/:id/summary
 * Living snapshot: mission, team map, open tasks/deadlines, latest meeting, key docs, decisions.
 * Auto-created on first request.
 */
export async function getWorkspaceSummary(workspaceId) {
  return callAPI(() =>
    apiClient.get(`/api/assistant/workspaces/${workspaceId}/summary`)
  );
}

/**
 * POST /api/assistant/workspaces/:id/summary/refresh
 */
export async function refreshWorkspaceSummary(workspaceId) {
  return callAPI(() =>
    apiClient.post(`/assistant/workspaces/${workspaceId}/summary/refresh`)
  );
}

// ─── 9. Health & Usage ───────────────────────────────────────────────────────

/**
 * GET /api/assistant/health (no auth required)
 * @returns {{ upstream_configured: boolean, vector_store_available: boolean, telegram_configured: boolean }}
 */
export async function getHealth() {
  try {
    const res = await apiClient.get('/api/assistant/health');
    return res.data;
  } catch {
    return { upstream_configured: false, vector_store_available: false, telegram_configured: false };
  }
}

/**
 * GET /api/assistant/usage
 * Caller's remaining budget.
 * @returns {{ requests_today, tokens_used_today, daily_token_limit, requests_per_minute_limit }}
 */
export async function getUsage() {
  return callAPI(() => apiClient.get('/api/assistant/usage'));
}

// ─── Default export as object (matches integration guide quick-start snippets) ─

const assistantService = {
  chat,
  ask,
  getConversations,
  getConversationMessages,
  ingestFile,
  ingestText,
  syncDrive,
  listDocuments,
  getDocument,
  deleteDocument,
  getDocumentVersions,
  getDocumentChanges,
  writeDocument,
  executeAction,
  getActionHistory,
  getWorkspaceSummary,
  refreshWorkspaceSummary,
  getHealth,
  getUsage,
};

export default assistantService;
