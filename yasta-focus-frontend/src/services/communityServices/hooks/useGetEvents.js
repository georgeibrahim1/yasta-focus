import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetEvents = () => {
  return useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => communityService.getEvents()
  })
}
