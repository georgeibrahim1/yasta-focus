import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetCommunities = (params = {}) => {
  return useQuery({
    queryKey: ['communities', JSON.stringify(params)],
    queryFn: () => communityService.getCommunities(params),
    staleTime: 0,
    enabled: true
  })
}
