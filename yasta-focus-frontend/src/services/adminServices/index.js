import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

// Get platform statistics
export const useGetPlatformStats = () => {
  return useQuery({
    queryKey: ['admin', 'platform-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats/platform')
      return data
    },
  })
}

// Get top users by XP
export const useGetTopUsers = (limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'top-users', limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/users/top?limit=${limit}`)
      return data
    },
  })
}

// Get recent users
export const useGetRecentUsers = (limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'recent-users', limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/users/recent?limit=${limit}`)
      return data
    },
  })
}

// Get active communities
export const useGetActiveCommunities = (limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'active-communities', limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/communities/active?limit=${limit}`)
      return data
    },
  })
}

// Get user growth statistics
export const useGetUserGrowth = () => {
  return useQuery({
    queryKey: ['admin', 'user-growth'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats/user-growth')
      return data
    },
  })
}

// Get study activity statistics
export const useGetStudyActivity = () => {
  return useQuery({
    queryKey: ['admin', 'study-activity'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats/study-activity')
      return data
    },
  })
}

// Get all users with pagination
export const useGetAllUsers = (page = 1, limit = 20, search = '') => {
  return useQuery({
    queryKey: ['admin', 'users', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/users?page=${page}&limit=${limit}&search=${search}`)
      return data
    },
  })
}

// Get reports
export const useGetReports = () => {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/reports')
      return data
    },
  })
}

// Update report status
export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reporterId, reportedId, status }) => {
      const { data } = await api.patch(`/api/admin/reports/${reporterId}/${reportedId}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    },
  })
}

// Delete report
export const useDeleteReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reporterId, reportedId }) => {
      const { data } = await api.delete(`/api/admin/reports/${reporterId}/${reportedId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    },
  })
}

// Update user role
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await api.patch(`/api/admin/users/${userId}/role`, { role })
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'top-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'recent-users'] })
    },
  })
}

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.delete(`/api/admin/users/${userId}`)
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'top-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'recent-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-stats'] })
    },
  })
}

// Get system logs
export const useGetLogs = (params = {}) => {
  return useQuery({
    queryKey: ['admin', 'logs', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page)
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.action_type && params.action_type !== 'all') queryParams.append('action_type', params.action_type)
      if (params.actor_type && params.actor_type !== 'all') queryParams.append('actor_type', params.actor_type)
      if (params.user_id) queryParams.append('user_id', params.user_id)
      if (params.start_date) queryParams.append('start_date', params.start_date)
      if (params.end_date) queryParams.append('end_date', params.end_date)
      if (params.order_by) queryParams.append('order_by', params.order_by)

      const { data } = await api.get(`/api/admin/logs?${queryParams.toString()}`)
      return data
    },
  })
}

// Get session statistics
export const useGetSessionStats = () => {
  return useQuery({
    queryKey: ['admin', 'session-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats/sessions')
      return data
    },
  })
}

// Get content statistics
export const useGetContentStats = () => {
  return useQuery({
    queryKey: ['admin', 'content-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats/content')
      return data
    },
  })
}

// Get engagement statistics
export const useGetEngagementStats = () => {
  return useQuery({
    queryKey: ['admin', 'engagement-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/stats/engagement')
      return data
    },
  })
}
