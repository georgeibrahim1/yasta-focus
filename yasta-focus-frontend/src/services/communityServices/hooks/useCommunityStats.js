import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useCommunityStats = (communityId) => {
  return useQuery({
    queryKey: ['communityStats', communityId],
    queryFn: () => communityService.getCommunityStats(communityId),
    enabled: !!communityId
  })
}
