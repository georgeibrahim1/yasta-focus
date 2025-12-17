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

  // Get all members of a community
  getCommunityMembers: async (communityId) => {
    const response = await api.get(`/api/communities/${communityId}/members`)
    return response.data.data
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

  // Create a new event
  createEvent: async (eventData) => {
    const response = await api.post('/api/events', eventData)
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
  },

  // Get community statistics (managers only)
  getCommunityStats: async (communityId) => {
    const response = await api.get(`/api/communities/${communityId}/stats`)
    return response.data.data.stats
  },

  // Update community info (managers only)
  updateCommunityInfo: async (communityId, communityData) => {
    const response = await api.patch(`/api/communities/${communityId}`, communityData)
    return response.data.data.community
  },

  // Delete community (managers only)
  deleteCommunity: async (communityId) => {
    const response = await api.delete(`/api/communities/${communityId}`)
    return response.data
  },

  // Update member bio
  updateMemberBio: async (communityId, bio) => {
    const response = await api.patch(`/api/communities/${communityId}/bio`, { bio })
    return response.data.data.participant
  },

  // Leave community
  exitCommunity: async (communityId) => {
    const response = await api.delete(`/api/communities/${communityId}/leave`)
    return response.data
  },

  // Remove member (managers only)
  removeMember: async (communityId, memberId) => {
    const response = await api.delete(`/api/communities/${communityId}/members/${memberId}`)
    return response.data
  },

  // Promote member to manager
  promoteMember: async (communityId, memberId) => {
    const response = await api.post(`/api/communities/${communityId}/members/${memberId}/promote`)
    return response.data
  },

  // Demote manager to regular member
  demoteMember: async (communityId, memberId) => {
    const response = await api.post(`/api/communities/${communityId}/members/${memberId}/demote`)
    return response.data
  },

  // Get pending join requests (managers only)
  getPendingRequests: async (communityId) => {
    const response = await api.get(`/api/communities/${communityId}/pending`)
    return response.data.data.pendingMembers
  },

  // Approve join request (managers only)
  approveJoinRequest: async (communityId, memberId) => {
    const response = await api.post(`/api/communities/${communityId}/pending/${memberId}/approve`)
    return response.data
  },

  // Reject join request (managers only)
  rejectJoinRequest: async (communityId, memberId) => {
    const response = await api.delete(`/api/communities/${communityId}/pending/${memberId}/reject`)
    return response.data
  },

  // Add member by username (managers only)
  addMemberByUsername: async (communityId, username) => {
    const response = await api.post(`/api/communities/${communityId}/add-member`, { username })
    return response.data
  },

  // Invite friend to community (any member)
  inviteFriendToCommunity: async (communityId, friendId) => {
    const response = await api.post(`/api/communities/${communityId}/invite-friend`, { friendId })
    return response.data
  },

  // Get community competitions
  getCommunityCompetitions: async (communityId) => {
    const response = await api.get(`/api/communities/${communityId}/competitions`)
    return response.data.data
  },

  // Create community competition (managers only)
  createCommunityCompetition: async (communityId, competitionData) => {
    const response = await api.post(`/api/communities/${communityId}/competitions`, competitionData)
    return response.data.data
  },

  // Join community competition
  joinCommunityCompetition: async (communityId, competitionId, payload) => { // Accept payload
    const subjectsArray = payload.subjects; // Extract subjects array from payload
    const response = await api.post(`/api/communities/${communityId}/competitions/${competitionId}/join`, { subjects: subjectsArray }) // Send as { subjects: [...] }
    return response.data
  },

  // Get competition entries
  getCommunityCompetitionEntries: async (communityId, competitionId) => {
    const response = await api.get(`/api/communities/${communityId}/competitions/${competitionId}/entries`)
    return response.data.data
  },

  // Delete community competition (managers only)
  deleteCommunityCompetition: async (communityId, competitionId) => {
    const response = await api.delete(`/api/communities/${communityId}/competitions/${competitionId}`)
    return response.data
  }
}

// Export individual functions for convenience
export const { 
  getCommunities,
  getAllTags,
  getCommunityMembers,
  joinCommunity,
  leaveCommunity,
  createCommunity,
  getEvents,
  createEvent,
  getCompetitions,
  joinCompetition,
  getCommunityStats,
  updateCommunityInfo,
  deleteCommunity,
  updateMemberBio,
  exitCommunity,
  removeMember,
  promoteMember,
  demoteMember,
  getPendingRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getCommunityCompetitions,
  createCommunityCompetition,
  joinCommunityCompetition,
  getCommunityCompetitionEntries,
  deleteCommunityCompetition
} = communityService
