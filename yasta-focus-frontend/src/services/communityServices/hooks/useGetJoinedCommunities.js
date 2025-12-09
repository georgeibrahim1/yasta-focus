import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetJoinedCommunities = () => {
  return useQuery({
    queryKey: ['communities', 'joined'],
    queryFn: () => communityService.getJoinedCommunities()
  })
}
