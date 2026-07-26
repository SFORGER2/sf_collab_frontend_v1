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
// Startups API
export const startupsAPI = {
  // Get all startups with filters
  getAll: async (params = {}) => {
    const response = await api.get('/startups', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params,
      },
    })
    return response.data
  },
  getTopStartups: async (params = {}) => {
    const response = await api.get('/startups/top', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 3,
        ...params,
      },
    })
    return response.data
  },
  // Get single startup
  getById: async (startupId, userId = null) => {
    const response = await api.get(`/startups/${startupId}`, {
      params: {
        user_id: userId,
      },
    })
    return response.data
  },

  // Register new startup
  register: async (formData) => {
    const response = await api.post('/startups/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  // Register an ALREADY-OPERATING startup (lighter flow — no financial
  // wizard, no roles/tech-stack setup). Content-Type is left undefined
  // on purpose: the browser sets the multipart boundary automatically
  // when given a FormData body; hardcoding the string breaks it.
  registerExisting: async (formData) => {
    const response = await api.post('/startups/register-existing', formData, {
      headers: {
        'Content-Type': undefined,
      },
    })
    return response.data.data
  },

  // Update startup
  update: async (startupId, data) => {
    const response = await api.put(`/startups/${startupId}`, data)
    return response.data
  },

  // Delete startup
  delete: async (startupId) => {
    const response = await api.delete(`/startups/${startupId}`)
    return response.data
  },
  leaveStartup: async (startupId) => {
    const response = await api.delete(`/startups/${startupId}/leave`)
    return response.data
  },
  // Get startup members
  getMembers: async (startupId) => {
    const response = await api.get(`/startups/${startupId}/members`)
    return response.data
  },

  // Add member to startup
  addMember: async (startupId, memberData) => {
    const response = await api.post(
      `/startups/${startupId}/members`,
      memberData
    )
    return response.data
  },

  // Remove member from startup
  removeMember: async (startupId, memberId) => {
    const response = await api.delete(
      `/startups/${startupId}/members/${memberId}`
    )
    return response.data
  },









  // Get startup documents
  getDocuments: async (startupId) => {
    const response = await api.get(`/startups/${startupId}/documents`)
    return response.data
  },

  // Upload document
  uploadDocument: async (startupId, formData) => {
    const response = await api.post(
      `/startups/${startupId}/documents`,
      formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  // Delete document
  deleteDocument: async (startupId, documentId) => {
    const response = await api.delete(
      `/startups/${startupId}/documents/${documentId}`)
    return response.data
  },

  // Download document
  downloadDocument: async (startupId, documentId) => {
    const response = await api.get(
      `/startups/${startupId}/documents/${documentId}/download`, {
        responseType: 'blob'
      })
    return response
  },

  // Get startup stats
  getStats: async (startupId) => {
    const response = await api.get(`/startups/${startupId}/stats`)
    return response.data
  },

  // Get user's startups
  getUserStartups: async (userId, params = {}) => {
    const response = await api.get(`/startups/user/${userId}`, {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params,
      },
    })
    return response.data
  },
  getUserStartupNames: async () => {
    const response = await api.get(`/startups/names`)
    return response.data
  },
  // Get industries
  getIndustries: async () => {
    const response = await api.get('/startups/industries')
    return response.data
  },

  // Get stages
  getStages: async () => {
    const response = await api.get('/startups/stages')
    return response.data
  },

  // Get join requests
  getJoinRequests: async (startupId, params = {}) => {
    const response = await api.get(`/startups/${startupId}/join-requests`, {
      params: {
        status: params.status || 'pending',
        ...params,
      },
    })
    console.log("Join requests:", response);
    return response.data
  },
  getJoinRequestByUserAndStartup: async (startupId, userId) => {
    const response = await api.get(
      `/startups/user/${userId}/startup/${startupId}`
    )
    return response.data
  },
  // Send a join request as a regular user
  sendJoinRequest: async (startupId, payload) => {
    try {
      // Use the axios instance which already has the correct baseURL (/api in dev)
      const response = await api.post(`/startups/${startupId}/join-request`, payload)
      return response.data
    } catch (error) {
      console.error('Error sending join request:', error)
      throw error
    }
  },
  deleteJoinRequest: async (requestId) => {
    const response = await api.delete(
      `/join-requests/${requestId}`
    )
    return response.data
  },
  // Accept join request
  acceptJoinRequest: async (startupId, requestId) => {
    const response = await api.post(
      `/startups/${startupId}/join-requests/${requestId}/accept`
    )
    return response.data
  },

  // Reject join request
  rejectJoinRequest: async (startupId, requestId) => {
    const response = await api.post(
      `/startups/${startupId}/join-requests/${requestId}/reject`
    )
    return response.data
  },

// Startup Invitations (NEW)


inviteMember: async (startupId, payload) => {
  const response = await api.post(
    `/startups/${startupId}/invitations`,
    payload
  )
  return response.data
},

getMyInvitation: async (startupId) => {
  // Fetches only the current user's own pending invitation — no manager role needed
  const response = await api.get(
    `/startups/${startupId}/invitations/mine`
  )
  return response.data
},

/**
 * Every invitation addressed to the signed-in user, across all startups.
 *
 * FIX: /invitations called this and it did not exist, so the page rendered its
 * error state on every load. The existing `getMyInvitation` is scoped to one
 * startup, which the inbox cannot use — it does not know the startup ids yet.
 *
 * BACKEND: needs GET /api/startups/invitations/mine returning
 * { success, data: { invitations: [{ id, startup_id, startup_name, role,
 *   invited_by, status, created_at }] } }. Falls back to an empty list rather
 * than throwing, so a missing route shows "no invitations" instead of an error.
 */
getMyInvitations: async (params = {}) => {
  try {
    const response = await api.get('/startups/invitations/mine', {
      params: {
        status: params.status,
        page: params.page || 1,
        per_page: params.per_page || 50,
      },
    })
    return response.data
  } catch (error) {
    if (error?.response?.status === 404) return { success: true, data: { invitations: [] } }
    throw error
  }
},

getInvitations: async (startupId, params = {}) => {
  const response = await api.get(
    `/startups/${startupId}/invitations`,
    {
      params: {
        status: params.status || 'pending',
        ...params,
      },
    }
  )
  return response.data
},

acceptInvitation: async (startupId, invitationId) => {
  const response = await api.post(
    `/startups/${startupId}/invitations/${invitationId}/accept`
  )
  return response.data
},

declineInvitation: async (startupId, invitationId) => {
  // Backend route is /reject, not /decline
  const response = await api.post(
    `/startups/${startupId}/invitations/${invitationId}/reject`
  )
  return response.data
},


  // Cancel own join request
  cancelJoinRequest: async (requestId) => {
    const response = await api.post(
      `/startups/join-requests/${requestId}/cancel`
    )
    return response.data.data
  },

  toggleBookmarkStartup: async ({
    userId,
    startupId,
    //
  }) => {
    const response = await api.post('/startup-bookmarks/toggle', {
      user_id: userId,
      startup_id: startupId,
    })
    return response.data
  },
  getBookmarkStatus: async ({ startupId, userId }) => {
    const response = await api.get(`/startup-bookmarks/status`, {
      params: {
        startup_id: startupId,
        user_id: userId,
      },
    })
    return response.data;
  },
  getBookmarkedStartups: async (userId, params = {}) => {
    const response = await api.get(`/startup-bookmarks/startups`, {
      params: {
        user_id: userId,
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params,
      },
    })
    console.log("Bookmarked Startups:", response);
    return response.data
  },
  getApplications: async (params = {}) => {
    const response = await api.get('/join-requests', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params,
      },
    })
    return response.data
  },
  promoteMemberToAdmin: async (startupId, memberId) => {
    const response = await api.post(`/startups/${startupId}/members/${memberId}/promote`, {})
    return response.data
  },
  demoteMemberAdmin: async (startupId, memberId) => {
    const response = await api.post(`/startups/${startupId}/members/${memberId}/demote`, {})
    return response.data
  },
  changeMemberRole: async (startupId, memberId, newRole) => {
    const response = await api.post(`/startups/${startupId}/members/${memberId}/change-role`, { role: newRole })
    return response.data
  },
  getIdeaLaunchData: async (ideaId) => {
    const response = await api.get(`/startups/${ideaId}/launch-data`)
    return response.data
  },
  getInvestorMatches: async (startupId) => {
    const response = await api.get(`/matchmaking/startups/${startupId}/investors`)
    return response.data
  }
}
// Project Goals API
export const projectGoalsAPI = {
  // Get all project goals with filters
  getAll: async (params = {}) => {
    const response = await api.get('/project-goals', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 10,
        ...params,
      },
    })
    return response.data
  },

  // Get single project goal
  getById: async (goalId) => {
    const response = await api.get(`/project-goals/${goalId}`)
    return response.data.project_goal
  },

  // Create new project goal
  create: async (goalData) => {
    const response = await api.post('/project-goals', goalData)
    return response.data
  },

  // Update project goal
  update: async (goalId, goalData) => {
    const response = await api.put(`/project-goals/${goalId}`, goalData)
    return response.data
  },

  // Delete project goal
  delete: async (goalId) => {
    const response = await api.delete(`/project-goals/${goalId}`)
    return response.data
  },

  // Update goal progress
  updateProgress: async (goalId, progressData) => {
    const response = await api.put(`/project-goals/${goalId}/progress`, progressData)
    return response.data.project_goal
  },

  // Complete milestone
  completeMilestone: async (milestoneId, accessToken) => {
    const response = await api.post(`/milestones/complete`, {
      milestone_id: milestoneId
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },
  uncompleteMilestone: async (milestoneId, accessToken) => {
    const response = await api.post(`/milestones/uncomplete`, {
      milestone_id: milestoneId
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  // Get milestones for a goal
  getMilestones: async (goalId) => {
    const response = await api.get(`/project-goals/${goalId}/milestones`)
    return response.data.milestones
  },

  // Update goal status
  updateStatus: async (goalId, statusData) => {
    const response = await api.put(`/project-goals/${goalId}/status`, statusData)
    return response.data.project_goal
  },
}

// Calendar Events API
export const calendarEventsAPI = {
  // Get all calendar events with filters
  getAll: async (params = {}) => {
    const response = await api.get('/calendar-events', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 50,
        ...params,
      },
    })
    return response.data
  },

  // Get single calendar event
  getById: async (eventId) => {
    const response = await api.get(`/calendar-events/${eventId}`)
    return response.data.data.event
  },

  // Create new calendar event
  create: async (eventData) => {
    const response = await api.post('/calendar-events', eventData)
    return response.data
  },

  // Update calendar event
  update: async (eventId, eventData) => {
    const response = await api.put(`/calendar-events/${eventId}`, eventData)
    return response.data.data.event
  },

  // Update event dates
  updateDates: async (eventId, dateData) => {
    const response = await api.put(`/calendar-events/${eventId}/dates`, dateData)
    return response.data.data.event
  },

  // Delete calendar event
  delete: async (eventId) => {
    const response = await api.delete(`/calendar-events/${eventId}`)
    return response.data
  },

  // Get upcoming events
  getUpcoming: async (params = {}) => {
    const response = await api.get('/calendar-events/upcoming', {
      params: {
        hours_ahead: params.hours_ahead || 24,
        user_id: params.user_id,
      },
    })
    return response.data.data
  },

  // Get current user's calendar events
  getMyEvents: async (params = {}) => {
    const response = await api.get('/calendar-events/my-events', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 50,
        ...params,
      },
    })
    return response.data.data
  },

  // Create bulk calendar events
  createBulk: async (eventsData) => {
    const response = await api.post('/calendar-events/bulk', { events: eventsData })
    return response.data.data
  },

  // Sync external calendar
  syncExternal: async (syncData) => {
    const response = await api.post('/calendar-events/sync', syncData)
    return response.data.data
  },

  // Get calendar statistics
  getStats: async (params = {}) => {
    const response = await api.get('/calendar-events/stats', {
      params,
    })
    return response.data.data.stats
  },

  // Export calendar events
  export: async (format = 'json', userId = null) => {
    const response = await api.get('/calendar-events/export', {
      params: {
        format,
        user_id: userId,
      },
      responseType: format === 'csv' || format === 'ical' ? 'blob' : 'json',
    })
    return response
  },

  // Get shared events from startup calendars
  getShared: async (params = {}) => {
    const response = await api.get('/calendar-events/shared', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 50,
        ...params,
      },
    })
    return response.data.data
  },
}

export const tasksAPI = {
  // Get all tasks with filters
  getAll: async (params = {}) => {
    const response = await api.get('/tasks', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 50,
        ...params,
      },
    })
    return response.data
  },
  getTasksStats: async (params = {}) => {
    const response = await api.get('/tasks/stats', {
      params: {
        ...params,
      },
    })
    return response.data
  },
  // Get single task by ID
  getById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data.task
  },

  // Create new task
  create: async (taskData) => {
    const response = await api.post('/tasks', taskData)
    return response.data
  },

  // Update task
  update: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData)
    return response.data
  },

  // Complete task
  completeTask: async (taskId) => {
    const response = await api.post(`/tasks/${taskId}/complete`)
    return response.data
  },

  // Assign task to user
  assignTask: async (taskId, assignedTo) => {
    const response = await api.put(`/tasks/${taskId}/assign`, { assigned_to: assignedTo })
    return response.data.task
  },

  // Delete task
  delete: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
  },

  // Get task statistics
  getStats: async (params = {}) => {
    const response = await api.get('/tasks/stats', {
      params: {
        ...params,
      },
    })
    return response.data.stats
  },

  // Get current user's tasks
  getMyTasks: async (params = {}) => {
    const response = await api.get('/tasks/my-tasks', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
        ...params,
      },
    })
    return response.data
  },

  // Get overdue tasks
  getOverdueTasks: async (params = {}) => {
    const response = await api.get('/tasks/overdue', {
      params: {
        page: params.page || 1,
        per_page: params.per_page || 20,
        ...params,
      },
    })
    return response.data
  },
}
export default api