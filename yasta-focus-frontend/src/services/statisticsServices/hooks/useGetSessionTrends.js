import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../service'

export const useGetSessionTrends = () => {
  return useQuery({
    queryKey: ['sessionTrends'],
    queryFn: async () => {
      const response = await statisticsService.getSessionTrends()
      return response.data?.trendsData || []
    },
    staleTime: 60000
  })
}
