import { useQuery } from '@tanstack/react-query';
import { communityService } from '../service';

export const useGetCommunityCompetitions = (communityId) => {
  return useQuery({
    queryKey: ['competitions', communityId],
    queryFn: () => communityService.getCommunityCompetitions(communityId),
    enabled: !!communityId, // Only run the query if communityId is available
  });
};
