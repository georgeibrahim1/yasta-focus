import { api } from '../api'

export const leaderboardService = {
  // Get leaderboard
  getLeaderboard: async (period = 'all') => {
    const response = await api.get('/api/leaderboard', { params: { period } })
    return response.data
  },

  // Get check-in status
  getCheckInStatus: async (toUserId) => {
    const response = await api.get('/api/leaderboard/checkin-status', { params: { toUserId } })
    return response.data.data
  },

  // Give XP to a user
  giveXP: async (userId, rank) => {
    const response = await api.post('/api/leaderboard/give-xp', { userId, rank })
    return response.data
  },

  // Send friend request
  sendFriendRequest: async (userId) => {
    const response = await api.post('/api/leaderboard/friend-request', { userId })
    return response.data
  },

  // Report user
  reportUser: async (userId, title, description) => {
    const response = await api.post('/api/leaderboard/report', { userId, title, description })
    return response.data
  }
}
