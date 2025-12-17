import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../service';

export const useJoinCommunityCompetition = (communityId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // The mutation function expects an object with competitionId and payload
    mutationFn: (data) => 
      communityService.joinCommunityCompetition(communityId, data.competitionId, data.payload),
    
    onSuccess: (_, { competitionId }) => {
      // Invalidate queries related to this specific competition to refresh its state
      queryClient.invalidateQueries({ queryKey: ['competition', competitionId] });
      // Optionally, invalidate the main list if the join status is shown there
      queryClient.invalidateQueries({ queryKey: ['competitions', communityId] });
    },
  });
};