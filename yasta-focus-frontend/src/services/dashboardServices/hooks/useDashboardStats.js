import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../service'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
