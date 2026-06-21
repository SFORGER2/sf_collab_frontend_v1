/**
 * driveService.js — SF Drive API service
 *
 * Maps all driveService.* calls used by:
 *   - FileLinkModal    (getLinkedObjects, linkToMilestone, linkToTask, unlink)
 *   - FileShareModal   (getPermissions, shareWithUser, shareWithWorkspace, updatePermission, revokePermission)
 *   - VersionHistoryModal (getVersions, restoreVersion, compareVersions)
 *   - FolderExplorerUI   (getFolders, getFiles, createFolder, uploadFile)
 *
 * Backend URL map (from blueprints.py):
 *   /api/drive/folders                           — folder CRUD
 *   /api/drive/files                             — file metadata CRUD
 *   /api/drive/files/upload                      — binary upload
 *   /api/drive/files/:id/download                — binary download
 *   /api/drive/files/:id/versions                — version list
 *   /api/drive/files/:id/versions/:vid/restore   — restore version
 *   /api/drive/files/:id/links                   — link CRUD
 *   /api/drive/files/:id/permissions             — permission list
 *   /api/drive/files/:id/permissions/grant       — grant permission
 *   /api/drive/files/:id/permissions/revoke      — revoke permission
 *   /api/drive/files/list                        — advanced list with pagination
 *   /api/drive/audit/:file_id                    — audit log
 */

import axios from 'axios';
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from '@/utils/APIs/interceptors';

// Relative baseURL — same pattern as all working ERP pages, avoids double /api prefix
const api = axios.create({ baseURL: '/api/drive' });
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
api.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// ── helpers ────────────────────────────────────────────────────────────────
const unwrap = (res) => res.data?.data ?? res.data;

// ── Folders ────────────────────────────────────────────────────────────────
const getFolders = async (workspaceId) => {
  const res = await api.get('/folders', { params: { workspace_id: workspaceId } });
  return unwrap(res);
};

const createFolder = async (workspaceId, name, parentFolderId = null) => {
  const res = await api.post('/folders', {
    workspace_id: workspaceId,
    name,
    parent_folder_id: parentFolderId,
  });
  return unwrap(res);
};

const deleteFolder = async (folderId) => {
  const res = await api.delete(`/folders/${folderId}`);
  return unwrap(res);
};

// ── Files ──────────────────────────────────────────────────────────────────
/**
 * List files for a workspace (uses drive_routes list, returns active files).
 * workspaceId is the startup_id / workspace_id.
 */
const getFiles = async (workspaceId, folderId = null) => {
  const params = { workspace_id: workspaceId };
  if (folderId != null) params.folder_id = folderId;
  const res = await api.get('/files', { params });
  return unwrap(res);
};

/**
 * Advanced paginated file list (drive_files_routes).
 */
const listFiles = async ({ workspaceId, folderId, page = 1, perPage = 20, sort = 'updated_at', order = 'desc' } = {}) => {
  const params = { page, per_page: perPage, sort, order };
  if (workspaceId) params.workspace_id = workspaceId;
  if (folderId != null) params.folder_id = folderId;
  const res = await api.get('/files/list', { params });
  return unwrap(res); // { items, total, page, pages, per_page }
};

/**
 * Upload a binary file to drive.
 * ownerScopeType: 'personal' | 'startup' | 'org'
 * ownerScopeId:   startup_id / user_id / org_id
 */
const uploadFile = async (file, { ownerScopeType, ownerScopeId, workspaceId, folderId, visibility = 'private', sensitivity = 'internal' } = {}) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('owner_scope_type', ownerScopeType || 'startup');
  fd.append('owner_scope_id', String(ownerScopeId || workspaceId));
  if (workspaceId) fd.append('workspace_id', String(workspaceId));
  if (folderId)    fd.append('parent_folder_id', String(folderId));
  fd.append('visibility_scope',  visibility);
  fd.append('sensitivity_level', sensitivity);
  // Let axios set Content-Type with boundary automatically
  const res = await api.post('/files/upload', fd);
  return unwrap(res);
};

const deleteFile = async (fileId) => {
  const res = await api.delete(`/files/${fileId}`);
  return unwrap(res);
};

const downloadFile = async (fileId, filename) => {
  const res = await api.get(`/files/${fileId}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'file';
  a.click();
  URL.revokeObjectURL(url);
};

const searchFiles = async (query, workspaceId) => {
  const res = await api.get('/files/search', { params: { q: query, workspace_id: workspaceId } });
  return unwrap(res);
};

// ── Versions ───────────────────────────────────────────────────────────────
const getVersions = async (fileId) => {
  const res = await api.get(`/files/${fileId}/versions`);
  const raw = unwrap(res);
  // backend returns array directly
  return { versions: Array.isArray(raw) ? raw : raw?.versions || [] };
};

const restoreVersion = async (fileId, versionId) => {
  const res = await api.post(`/files/${fileId}/versions/${versionId}/restore`);
  return unwrap(res);
};

/**
 * compareVersions — backend has no diff endpoint, return both version dicts
 * so the UI can show the version details side-by-side.
 */
const compareVersions = async (fileId, versionIdA, versionIdB) => {
  const { versions } = await getVersions(fileId);
  const a = versions.find((v) => v.id === versionIdA);
  const b = versions.find((v) => v.id === versionIdB);
  return {
    version_a: { summary: a ? `v${a.version_number} — ${new Date(a.created_at).toLocaleDateString()}` : 'Unknown', preview: null },
    version_b: { summary: b ? `v${b.version_number} — ${new Date(b.created_at).toLocaleDateString()}` : 'Unknown', preview: null },
  };
};

// ── Links / Relations ──────────────────────────────────────────────────────
/**
 * getLinkedObjects — returns { links: [...] } shaped for FileLinkModal.
 * Backend returns { relations: [...] }, we normalise.
 */
const getLinkedObjects = async (fileId) => {
  const res = await api.get(`/files/${fileId}/links`);
  const raw = unwrap(res);
  const relations = raw?.relations || raw || [];
  const links = relations.map((r) => ({
    id:          r.id,
    entity_type: r.relation_type,          // milestone | task | meeting | ...
    entity_id:   r.related_entity_id,
    entity_name: r.related_entity_label || null,
  }));
  return { links };
};

const linkToMilestone = async (fileId, milestoneId) => {
  const res = await api.post(`/files/${fileId}/links`, {
    relation_type:        'milestone',
    related_entity_id:    milestoneId,
    related_entity_type:  'milestone',
  });
  return unwrap(res);
};

const linkToTask = async (fileId, taskId) => {
  const res = await api.post(`/files/${fileId}/links`, {
    relation_type:        'task',
    related_entity_id:    taskId,
    related_entity_type:  'task',
  });
  return unwrap(res);
};

/**
 * unlink — FileLinkModal passes (entityType, entityId), we DELETE by entity.
 */
const unlink = async (fileId, entityType, entityId) => {
  const res = await api.delete(`/files/${fileId}/links`, {
    data: { relation_type: entityType, related_entity_id: entityId },
  });
  return unwrap(res);
};

// ── Permissions ────────────────────────────────────────────────────────────
/**
 * getPermissions — returns { permissions: [...] } shaped for FileShareModal.
 */
const getPermissions = async (fileId) => {
  const res = await api.get(`/files/${fileId}/permissions`);
  const raw = unwrap(res);
  const perms = Array.isArray(raw) ? raw : raw?.permissions || [];
  // normalise to what FileShareModal expects
  const permissions = perms.map((p) => ({
    id:               p.id,
    permission_level: p.role,           // viewer | editor | owner
    subject_type:     'user',
    subject_id:       p.user_id,
    subject_name:     p.user_name || `User #${p.user_id}`,
  }));
  return { permissions };
};

/**
 * shareWithUser — grants view/edit to a user.
 * permission_level ('view'|'edit') → role ('viewer'|'editor')
 */
const shareWithUser = async (fileId, userId, permissionLevel) => {
  const roleMap = { view: 'viewer', edit: 'editor', owner: 'owner' };
  const res = await api.post(`/files/${fileId}/permissions/grant`, {
    user_id: userId,
    role: roleMap[permissionLevel] || permissionLevel,
  });
  return unwrap(res);
};

/**
 * shareWithWorkspace — backend permission model only supports user-level grants.
 * We grant 'viewer' to the workspace owner as a proxy until workspace-level
 * permissions are added to the backend.
 */
const shareWithWorkspace = async (fileId, workspaceId, permissionLevel) => {
  // stub — backend has no workspace-level permission yet
  console.warn('[driveService] shareWithWorkspace not yet supported by backend');
  return { message: 'Workspace sharing coming soon' };
};

/**
 * updatePermission — FileShareModal calls with (permId, level).
 * We don't have an update endpoint; revoke + re-grant is the workaround.
 * Backend grant endpoint upserts so we can just call grant again.
 */
const updatePermission = async (fileId, permId, permissionLevel) => {
  // We need user_id to re-grant; FileShareModal has the perm object
  // so it should pass user_id — but it only passes permId.
  // Fetch permissions to resolve user_id.
  const { permissions } = await getPermissions(fileId);
  const perm = permissions.find((p) => p.id === permId);
  if (!perm) throw new Error('Permission not found');
  return shareWithUser(fileId, perm.subject_id, permissionLevel);
};

const revokePermission = async (fileId, permId) => {
  const { permissions } = await getPermissions(fileId);
  const perm = permissions.find((p) => p.id === permId);
  if (!perm) throw new Error('Permission not found');
  const res = await api.delete(`/files/${fileId}/permissions/revoke`, {
    data: { user_id: perm.subject_id },
  });
  return unwrap(res);
};

// ── Audit ──────────────────────────────────────────────────────────────────
const getAuditLog = async (fileId) => {
  const res = await api.get(`/audit/${fileId}`);
  return unwrap(res);
};

// ── Export ─────────────────────────────────────────────────────────────────
const driveService = {
  // folders
  getFolders,
  createFolder,
  deleteFolder,
  // files
  getFiles,
  listFiles,
  uploadFile,
  deleteFile,
  downloadFile,
  searchFiles,
  // versions
  getVersions,
  restoreVersion,
  compareVersions,
  // links
  getLinkedObjects,
  linkToMilestone,
  linkToTask,
  unlink,
  // permissions
  getPermissions,
  shareWithUser,
  shareWithWorkspace,
  updatePermission,
  revokePermission,
  // audit
  getAuditLog,
};

export default driveService;