import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../service'

export const useGetWeeklyStudyTime = () => {
  return useQuery({
    queryKey: ['weeklyStudyTime'],
    queryFn: async () => {
      const response = await statisticsService.getWeeklyStudyTime()
      return response.data?.weeklyData || []
    },
    staleTime: 60000 // 1 minute
  })
}
