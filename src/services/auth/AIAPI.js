import axios from 'axios'
import { API_URL } from '@/utils/config'

// filepath: /Users/ivandavidgomezsilva/Documents/Ivan/Trabajos/SFORGER/SForger_data/SFRepos/sf_collab_frontend_v1/src/services/auth/AIAPI.js

const API_URL_AI = `${API_URL}/ai`

const aiApiInstance = axios.create({
  baseURL: API_URL_AI,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Optional debug logs
aiApiInstance.interceptors.request.use(
  (config) => {
    console.log('AI API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => Promise.reject(error)
)

aiApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export class AIAPI {
  static async health() {
    const { data } = await aiApiInstance.get('/health')
    return data
  }

  static async getModels() {
    const { data } = await aiApiInstance.get('/models')
    return data
  }

  static async generate(payload, accessToken) {
    const { data } = await aiApiInstance.post('/generate', {
      prompt: payload.prompt,
      model: payload.model || 'qwen/qwen3-32b',
      content_type: payload.contentType || 'chat', // 'chat', 'business_plan', 'pitch_deck'
      temperature: payload.temperature || 0.7,
      max_tokens: payload.maxTokens || 2048,
      output_format: payload.outputFormat || 'text', // 'text', 'json'
      metadata: payload.metadata || {},
    }, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
    return data
  }

  static async generateBusinessPlan(payload, accessToken) {
    const { data } = await aiApiInstance.post('/business-ideas', payload, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
    return data
  }

  static async download(filename, accessToken) {
    const { data } = await aiApiInstance.get(`/download/${filename}`, {
      responseType: 'blob',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
    return data
  }
  static async uploadDocument(file, accessToken) {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await aiApiInstance.post('/assistant/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })
    return data
  }

  
}

export const healthAI = AIAPI.health
export const getModelsAI = AIAPI.getModels
export const generateAI = AIAPI.generate
export const downloadAI = AIAPI.download
export default aiApiInstance
