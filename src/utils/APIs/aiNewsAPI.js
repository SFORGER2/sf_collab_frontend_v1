import api from './interceptors';

export const aiNewsAPI = {
  getArticles: async () => {
    const response = await api.get('/ai-news/ainews');
    return response.data;
  }
};
