import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'

export const useGetStreamToken = () => {
  return useQuery({
    queryKey: ['stream', 'token'],
    queryFn: async () => {
      const response = await api.get('/api/events/stream/token')
      return response.data.data
    },
    staleTime: 1000 * 60 * 55, // Token valid for 55 minutes
  })
}
