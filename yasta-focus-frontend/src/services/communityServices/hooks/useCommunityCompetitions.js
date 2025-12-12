import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useCommunityCompetitions = (communityId) => {
  return useQuery({
    queryKey: ['communityCompetitions', communityId],
    queryFn: () => communityService.getCommunityCompetitions(communityId),
    enabled: !!communityId
  })
}
