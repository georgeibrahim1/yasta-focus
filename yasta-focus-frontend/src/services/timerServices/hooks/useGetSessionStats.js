import { useQuery } from '@tanstack/react-query'
import { timerService } from '../service'

export const useGetSessionStats = (period = 'week', options = {}) => {
  return useQuery({
    queryKey: ['sessionStats', period],
    queryFn: () => timerService.getSessionStats(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  })
}
