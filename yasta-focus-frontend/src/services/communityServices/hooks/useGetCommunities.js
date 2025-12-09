import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetCommunities = (searchQuery) => {
  return useQuery({
    queryKey: ['communities', searchQuery || 'all'],
    queryFn: () => communityService.getCommunities(searchQuery),
    keepPreviousData: true
  })
}
