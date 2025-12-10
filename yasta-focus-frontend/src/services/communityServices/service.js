import { api } from '../api'

export const communityService = {
  // Get all communities with filters and pagination
  getCommunities: async (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.search) queryParams.append('search', params.search)
    if (params.tags) queryParams.append('tags', params.tags)
    if (params.sizeMin) queryParams.append('sizeMin', params.sizeMin)
    if (params.sizeMax) queryParams.append('sizeMax', params.sizeMax)
    if (params.showJoined) queryParams.append('showJoined', params.showJoined)
    
    const response = await api.get(`/api/communities?${queryParams.toString()}`)
    return response.data
  },

  // Get all unique tags
  getAllTags: async () => {
    const response = await api.get('/api/communities/tags')
    return response.data
  },

  // Join a community
  joinCommunity: async (communityId) => {
    const response = await api.post(`/api/communities/${communityId}/join`)
    return response.data
  },

  // Leave a community
  leaveCommunity: async (communityId) => {
    const response = await api.post(`/api/communities/${communityId}/leave`)
    return response.data
  },

  // Create a new community
  createCommunity: async (communityData) => {
    const response = await api.post('/api/communities', communityData)
    return response.data
  },

  // Get upcoming events
  getEvents: async () => {
    const response = await api.get('/api/events/upcoming')
    return response.data
  },

  // Get all competitions
  getCompetitions: async () => {
    const response = await api.get('/api/competitions/all')
    return response.data
  },

  // Join a competition
  joinCompetition: async (competitionId, payload) => {
    const response = await api.post(`/api/competitions/${competitionId}/join`, payload)
    return response.data
  }
}
