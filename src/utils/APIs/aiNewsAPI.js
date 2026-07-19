import api from './interceptors';
import axios from 'axios';
import { API_CONFIG, requestInterceptor, requestErrorInterceptor, responseInterceptor, responseErrorInterceptor } from './interceptors';

export const aiNewsAPI = {
  /**
   * Fetch AI news articles (unfiltered).
   * GET /api/ai-news/ainews
   */
  getArticles: async () => {
    const response = await api.get('/ai-news/ainews');
    return response.data;
  },

  /**
   * Scrape latest news from external feeds.
   * POST /api/ai-news/ainews/scrape
   */
  scrapeNews: async () => {
    const response = await api.post("/ai-news/ainews/scrape");
    return response.data;
  },

  /**
   * Enrich news articles using LLMs/enrichment service.
   * POST /api/ai-news/ainews/enrich
   */
  enrichNews: async () => {
    const response = await api.post("/ai-news/ainews/enrich");
    return response.data;
  },

  /**
   * Fetch personalized AI news digest.
   * GET /api/ai-news/ainews/digest
   */
  getDigest: async (params = {}) => {
    const response = await api.get('/ai-news/ainews/digest', { params });
    return response.data;
  },

  /**
   * Fetch AI news articles with query parameters.
   * GET /api/ai-news/ainews
   */
  getAINews: async (params = {}) => {
    const response = await api.get('/ai-news/ainews', { params });
    return response.data;
  },

  /**
   * Alias for getAINews (used in AINewsPage).
   * GET /api/ai-news/ainews
   */
  getNews: async (params = {}) => {
    const response = await api.get('/ai-news/ainews', { params });
    return response.data;
  },

  /**
   * Fetch list of category tags.
   * GET /api/ai-news/ainews/categories
   */
  getCategories: async () => {
    const response = await api.get('/ai-news/ainews/categories');
    return response.data;
  },

  /**
   * Fetch available news sources dynamically.
   * GET /api/ai-news/ainews/sources
   */
  getSources: async () => {
    const response = await api.get('/ai-news/ainews/sources');
    return response.data;
  },
};

export default aiNewsAPI;