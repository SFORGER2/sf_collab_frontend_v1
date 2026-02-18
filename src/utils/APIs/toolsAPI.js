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
};

export default api;