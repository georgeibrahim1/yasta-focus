import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../service';

export const useCreateCommunityCompetition = (communityId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (competitionData) => communityService.createCommunityCompetition(communityId, competitionData),
    onSuccess: () => {
      // Invalidate and refetch the competitions list so the new one appears
      queryClient.invalidateQueries({ queryKey: ['competitions', communityId] });
    },
  });
};