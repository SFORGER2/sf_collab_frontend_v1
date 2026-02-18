import axios from 'axios'
import { API_CONFIG, requestErrorInterceptor, requestInterceptor, responseErrorInterceptor, responseInterceptor } from './interceptors';

const api = axios.create(API_CONFIG)

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

// AI API
export const aiAPI = {
  // Health check
  getHealth: async () => {
    const response = await api.get('/ai/health');
    return response.data;
  },

  // Get available models
  getAvailableModels: async () => {
    const response = await api.get('/ai/models');
    return response.data.data;
  },

  // Generate content (business plan, pitch deck, etc.)
  generateContent: async ({ prompt, model, contentType = 'chat', temperature = 0.7, maxTokens = 2048, outputFormat = 'text', metadata = {} }) => {
    const response = await api.post('/ai/generate', {
      prompt,
      model,
      content_type: contentType,
      metadata,
      temperature,
      max_tokens: maxTokens,
      output_format: outputFormat,
    });
    return response.data;
  },

  // Business ideas & plans (requires JWT)
  generateBusinessIdeas: async ({ prompt, contentType = 'business_ideas', model, temperature = 0.7, maxTokens = 4096, metadata = {} }) => {
    const response = await api.post('/ai/business-ideas', {
      prompt,
      content_type: contentType,
      model,
      temperature,
      max_tokens: maxTokens,
      metadata,
    });
    return response.data;
  },

  // Chat endpoint
  chat: async (messages, model, temperature = 0.7, maxTokens = 2048) => {
    const response = await api.post('/ai/chat', {
      messages,
      model,
      temperature,
      max_tokens: maxTokens,
    });
    return response.data.data;
  },

  // Download generated content
  downloadContent: async (filename) => {
    const response = await api.get(`/ai/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Generate logo (requires JWT)
  generateLogo: async ({ brandName, imagesAmount, industry = 'technology', style = 'minimal', colors = [], additionalNotes = '', subtitle = '' }) => {
    const response = await api.post('/ai/logo/generate', {
      brandName,
      industry,
      style,
      colors,
      additionalNotes,
      subtitle,
      imagesAmount
    });
    return response.data;
  },

  // Upload document for assistant (requires JWT, admin only)
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/ai/assistant/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Query assistant (requires JWT)
  queryAssistant: async (question) => {
    const response = await api.post('/ai/assistant/query', {
      question,
    });
    return response.data;
  },

  // Text to image (requires JWT)
  textToImage: async (prompt) => {
    const response = await api.post('/ai/image/text-to-image', {
      prompt,
    });
    return response.data;
  },
};

export default api;