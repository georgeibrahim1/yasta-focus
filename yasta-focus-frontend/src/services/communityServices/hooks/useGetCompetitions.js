import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetCompetitions = () => {
  return useQuery({
    queryKey: ['competitions', 'all'],
    queryFn: async () => {
      const response = await communityService.getCompetitions()
      return response.data || []
    }
  })
}
