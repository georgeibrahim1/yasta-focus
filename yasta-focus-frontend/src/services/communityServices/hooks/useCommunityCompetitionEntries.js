import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useCommunityCompetitionEntries = (communityId, competitionId) => {
  return useQuery({
    queryKey: ['communityCompetitionEntries', communityId, competitionId],
    queryFn: () => communityService.getCommunityCompetitionEntries(communityId, competitionId),
    enabled: !!communityId && !!competitionId
  })
}
