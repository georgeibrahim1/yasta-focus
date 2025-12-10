import { useQuery } from '@tanstack/react-query'
import { leaderboardService } from '../service'

export const useGetLeaderboard = (period = 'all') => {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const response = await leaderboardService.getLeaderboard(period)
      return response.data?.leaderboard || []
    },
    staleTime: 60000 // 1 minute
  })
}
