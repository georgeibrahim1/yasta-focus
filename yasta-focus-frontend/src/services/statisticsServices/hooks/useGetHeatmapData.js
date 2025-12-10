import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../service'

export const useGetHeatmapData = (year, month) => {
  return useQuery({
    queryKey: ['heatmapData', year, month],
    queryFn: async () => {
      const response = await statisticsService.getHeatmapData(year, month)
      return response.data || {}
    },
    staleTime: 300000 // 5 minutes
  })
}
