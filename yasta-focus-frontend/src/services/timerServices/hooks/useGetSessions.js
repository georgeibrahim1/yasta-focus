import { useQuery } from '@tanstack/react-query'
import { timerService } from '../service'

export const useGetSessions = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => timerService.getSessions(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  })
}
