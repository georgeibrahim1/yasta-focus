import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetCompetitions = () => {
  return useQuery({
    queryKey: ['competitions', 'all'],
    queryFn: () => communityService.getCompetitions()
  })
}
