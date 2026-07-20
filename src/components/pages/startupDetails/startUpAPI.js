import { API_BASE_URL } from '@/utils/config'
import axios from 'axios'

// filepath: /Users/ivandavidgomezsilva/Documents/Ivan/Trabajos/SFORGER/SForger_data/SFRepos/sf_collab_frontend_v1/src/components/pages/startupDetails/startUpAPI.js

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to backend. Make sure server is running on', API_BASE_URL)
    } else if (error.response) {
      console.error('API Error:', error.response.status, error.response.data)
    } else {
      console.error('API Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// Startup API
export const startupAPI = {
  getAll: async (accessToken, params) => {
    const response = await api.get('/startups', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        my_startups: params.my_startups || 'false',
        ...params,
      },
    })
    return response.data
  },
  getStartup: async (startupId, accessToken) => {
    const response = await api.get(`/startups/${startupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  getMembers: async (args) => {
    /*
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    startup_id = request.args.get('startup_id', type=int)
    user_id = request.args.get('user_id', type=int)
    is_active = request.args.get('is_active', type=bool)
    */
    
    const response = await api.get(`/startup-members`, {
      params: {
        page: args.page || 1,
        per_page: args.per_page || 10,
        startup_id: args.startup_id,
        user_id: args.user_id,
        is_active: args.is_active,
        ...args,
      }
    })
    return response.data
  },

  getDocuments: async (startupId, accessToken) => {
    const response = await api.get(`/startups/${startupId}/documents`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  getStats: async (startupId, accessToken) => {
    const response = await api.get(`/startups/${startupId}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  uploadDocument: async (startupId, formData, accessToken) => {
    const response = await api.post(`/startups/${startupId}/documents`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': undefined, // let the browser set the multipart boundary
      },
    })
    return response.data
  },

  deleteDocument: async (startupId, documentId, accessToken) => {
    const response = await api.delete(`/startups/${startupId}/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  downloadDocument: async (startupId, documentId, accessToken) => {
    const response = await api.get(`/startups/${startupId}/documents/${documentId}/download`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'blob',
    })
    return response.data
  },
  getMembersByStartupId: async (startupId, accessToken, params) => {
    const queryParams = new URLSearchParams()
    if (params) {
      if (params.startup_id) queryParams.append('startup_id', params.startup_id)
      if (params.page) queryParams.append('page', params.page)
      if (params.per_page) queryParams.append('per_page', params.per_page)
      if (params.user_id) queryParams.append('user_id', params.user_id)
      if (params.is_active !== undefined) queryParams.append('is_active', params.is_active)
    }
    const response = await api.get(`/startup-members?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },
  addMember: async (startupId, memberData, accessToken) => {
    const response = await api.post(`/startups/${startupId}/members`, memberData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  removeMember: async (startupId, memberId, accessToken) => {
    const response = await api.delete(`/startups/${startupId}/members/${memberId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  deleteStartup: async (startupId, accessToken) => {
    const response = await api.delete(`/startups/${startupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  getProjectGoals: async (startupId, accessToken) => {
    const response = await api.get(`/startups/${startupId}/goals`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  getCalendarEvents: async (startupId, accessToken) => {
    const response = await api.get(`/startups/${startupId}/events`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },
}

export default api