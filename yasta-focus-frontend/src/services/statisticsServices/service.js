import { api } from '../api'

export const statisticsService = {
  // Get weekly study time
  getWeeklyStudyTime: async () => {
    const response = await api.get('/api/sessions/stats/weekly')
    return response.data
  },

  // Get session trends
  getSessionTrends: async () => {
    const response = await api.get('/api/sessions/stats/trends')
    return response.data
  },

  // Get subject statistics
  getSubjectStats: async () => {
    const response = await api.get('/api/sessions/stats/subjects')
    return response.data
  },

  // Get heatmap data
  getHeatmapData: async (year, month) => {
    const response = await api.get('/api/sessions/stats/heatmap', {
      params: { year, month }
    })
    return response.data
  }
}
