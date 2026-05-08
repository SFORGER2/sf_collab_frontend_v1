import axios from 'axios';
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create(API_CONFIG);

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

// Tools API
export const toolsAPI = {
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  signPDF: async (fileId, filename, signature, position) => {
    const response = await api.post('/pdf/sign', {
      file_id: fileId,
      filename,
      signature,
      position,
    });
    return response.data;
  },

  downloadSignedPDF: async (filename) => {
    const response = await api.get(`/pdf/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  listSignedDocuments: async () => {
    const response = await api.get('/pdf/documents');
    return response.data;
  },

  deleteDocument: async (filename) => {
    const response = await api.delete(`/pdf/delete/${filename}`);
    return response.data;
  },

  // ============================================================================
  // ANIME CONVERTER API
  // ============================================================================

  // Convert image to anime style
  animeConvert: async (formData) => {
    const response = await api.post('/anime-converter/convert-advanced', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ============================================================================
  // BACKGROUND REMOVER API
  // ============================================================================

  // Get available background remover models
  backgroundRemoverGetModels: async () => {
    const response = await api.get('/background-remover/models');
    return response.data;
  },

  // Remove background from image
  backgroundRemoverRemove: async (formData) => {
    const response = await api.post('/background-remover/remove', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ============================================================================
  // IMAGE EDITOR API
  // ============================================================================

  // Process image with editor
  imageEditorProcess: async (formData) => {
    const response = await api.post('/image-editor/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Save edited image
  imageEditorSave: async (imageData) => {
    const response = await api.post('/image-editor/save', imageData);
    return response.data;
  },
};

export default api;