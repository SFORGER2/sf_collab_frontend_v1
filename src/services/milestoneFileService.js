import axios from 'axios';
import { requestInterceptor, responseInterceptor } from './interceptors';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_BASE}/api/milestone-files` });
api.interceptors.request.use(requestInterceptor);
api.interceptors.response.use((r) => r, responseInterceptor);

/**
 * Upload a file to a milestone.
 * @param {number} milestoneId
 * @param {File}   file          — raw File object from <input type="file">
 * @param {Function} onProgress  — optional (percent: number) => void
 */
export const uploadMilestoneFile = (milestoneId, file, onProgress) => {
  const form = new FormData();
  form.append('file', file);

  return api.post(`/${milestoneId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
      : undefined,
  });
};

/**
 * Get all files for a milestone.
 * Returns { proof_files, documents, total }
 */
export const getMilestoneFiles = (milestoneId) =>
  api.get(`/${milestoneId}`);

/**
 * Toggle (or explicitly set) is_proof on a file.
 * @param {number}  fileId
 * @param {boolean} [isProof]  — omit to toggle server-side
 */
export const markFileAsProof = (fileId, isProof) =>
  api.patch(`/${fileId}/mark-proof`, isProof !== undefined ? { is_proof: isProof } : {});

/**
 * Delete a file.
 */
export const deleteMilestoneFile = (fileId) =>
  api.delete(`/${fileId}`);