import { api } from '../api'

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/api/users/dashboard/stats')
    return response.data
  }
}
