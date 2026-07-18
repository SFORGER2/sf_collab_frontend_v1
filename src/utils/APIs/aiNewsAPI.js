import axios from 'axios';
import {
  API_CONFIG,
  requestErrorInterceptor,
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor,
} from "./interceptors";

const api = axios.create(API_CONFIG);

api.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

api.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor
);

export const aiNewsAPI = {
  scrapeNews: async () => {
    const response = await api.post("/ai-news/ainews/scrape");
    return response.data;
  },

  enrichNews: async () => {
    const response = await api.post("/ai-news/ainews/enrich");
    return response.data;
  },
};
