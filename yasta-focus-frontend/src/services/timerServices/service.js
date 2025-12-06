import { api } from '../api'

export const timerService = {
  // Create a new timer session
  createSession: async (sessionData) => {
    const response = await api.post('/api/sessions', sessionData)
    return response.data
  },

  // Get all sessions for the current user
  getSessions: async (filters = {}) => {
    const response = await api.get('/api/sessions', { params: filters })
    return response.data
  },

  // Get a specific session by name
  getSession: async (sessionName) => {
    const response = await api.get(`/api/sessions/${encodeURIComponent(sessionName)}`)
    return response.data
  },

  // Update a session
  updateSession: async (sessionName, updateData) => {
    const response = await api.patch(`/api/sessions/${encodeURIComponent(sessionName)}`, updateData)
    return response.data
  },

  // Delete a session
  deleteSession: async (sessionName) => {
    const response = await api.delete(`/api/sessions/${encodeURIComponent(sessionName)}`)
    return response.data
  },

  // Get session statistics
  getSessionStats: async (period = 'week') => {
    const response = await api.get('/api/sessions/stats', { params: { period } })
    return response.data
  }
}
