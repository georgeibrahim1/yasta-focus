import { api } from '../api'

export const communityService = {
  getCommunities: async (searchQuery = '') => {
    const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
    const response = await api.get(`/api/communities${q}`)
    return response.data.data
  },

  getJoinedCommunities: async () => {
    const response = await api.get(`/api/communities/joined`)
    return response.data.data
  },

  getCommunity: async (id) => {
    const response = await api.get(`/api/communities/${encodeURIComponent(id)}`)
    return response.data.data
  },

  createCommunity: async (data) => {
    const response = await api.post(`/api/communities`, data)
    return response.data.data
  },

  requestJoin: async (communityId, payload) => {
    const response = await api.post(`/api/communities/${encodeURIComponent(communityId)}/join-request`, payload)
    return response.data.data
  },

  getCommunityRooms: async (communityId) => {
    const response = await api.get(`/api/communities/${encodeURIComponent(communityId)}/rooms`)
    return response.data.data
  },

  getEvents: async () => {
    const response = await api.get('/api/events/upcoming')
    return response.data.data
  },

  getCompetitions: async () => {
    const response = await api.get('/api/competitions/all')
    return response.data.data
  },

  joinCompetition: async (competitionId, payload) => {
    const response = await api.post(`/api/competitions/${encodeURIComponent(competitionId)}/join`, payload)
    return response.data.data
  }
}
