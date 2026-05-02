/**
 * SF Drive Service
 * Covers: file listing, version history, file linking, permissions/sharing
 */

import axios from 'axios';
import { getApiUrl } from '@/utils/config';
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from '@/utils/APIs/interceptors';

const api = axios.create({
  baseURL: `${getApiUrl()}/api/drive`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── Files ─────────────────────────────────────────────────────────────────────
export const driveService = {

  // List files with optional filters
  listFiles: (params = {}) =>
    api.get('/files', { params }).then(r => r.data),

  // Get single file (with summaries)
  getFile: (fileId) =>
    api.get(`/files/${fileId}`).then(r => r.data.file),

  // Update tags
  updateTags: (fileId, tags, mode = 'merge') =>
    api.patch(`/files/${fileId}/tags`, { tags, mode }).then(r => r.data),

  // Update knowledge type
  updateKnowledgeType: (fileId, knowledgeType) =>
    api.patch(`/files/${fileId}/knowledge-type`, { knowledge_type: knowledgeType }).then(r => r.data),

  // Delete file
  deleteFile: (fileId) =>
    api.delete(`/files/${fileId}`).then(r => r.data),

  // Reprocess (re-run pipeline)
  reprocess: (fileId) =>
    api.post(`/files/${fileId}/reprocess`).then(r => r.data),

  // ── Version History ─────────────────────────────────────────────────────────
  getVersions: (fileId) =>
    api.get(`/files/${fileId}/versions`).then(r => r.data),

  restoreVersion: (fileId, versionId) =>
    api.post(`/files/${fileId}/versions/${versionId}/restore`).then(r => r.data),

  compareVersions: (fileId, versionIdA, versionIdB) =>
    api.get(`/files/${fileId}/versions/compare`, {
      params: { version_a: versionIdA, version_b: versionIdB },
    }).then(r => r.data),

  // ── File Linking ────────────────────────────────────────────────────────────
  linkToMilestone: (fileId, milestoneId) =>
    api.post(`/files/${fileId}/link`, { entity_type: 'milestone', entity_id: milestoneId }).then(r => r.data),

  linkToTask: (fileId, taskId) =>
    api.post(`/files/${fileId}/link`, { entity_type: 'task', entity_id: taskId }).then(r => r.data),

  unlink: (fileId, entityType, entityId) =>
    api.delete(`/files/${fileId}/link`, { data: { entity_type: entityType, entity_id: entityId } }).then(r => r.data),

  getLinkedObjects: (fileId) =>
    api.get(`/files/${fileId}/links`).then(r => r.data),

  // ── Permissions / Sharing ───────────────────────────────────────────────────
  getPermissions: (fileId) =>
    api.get(`/files/${fileId}/permissions`).then(r => r.data),

  shareWithUser: (fileId, userId, permissionLevel = 'view') =>
    api.post(`/files/${fileId}/permissions`, {
      subject_type: 'user',
      subject_id: userId,
      permission_level: permissionLevel,
    }).then(r => r.data),

  shareWithWorkspace: (fileId, workspaceId, permissionLevel = 'view') =>
    api.post(`/files/${fileId}/permissions`, {
      subject_type: 'workspace',
      subject_id: workspaceId,
      permission_level: permissionLevel,
    }).then(r => r.data),

  revokePermission: (fileId, permissionId) =>
    api.delete(`/files/${fileId}/permissions/${permissionId}`).then(r => r.data),

  updatePermission: (fileId, permissionId, permissionLevel) =>
    api.patch(`/files/${fileId}/permissions/${permissionId}`, { permission_level: permissionLevel }).then(r => r.data),
};

export default driveService;