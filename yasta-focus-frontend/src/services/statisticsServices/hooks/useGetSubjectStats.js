import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../service'

export const useGetSubjectStats = () => {
  return useQuery({
    queryKey: ['subjectStats'],
    queryFn: async () => {
      const response = await statisticsService.getSubjectStats()
      return response.data || {}
    },
    staleTime: 60000
  })
}
