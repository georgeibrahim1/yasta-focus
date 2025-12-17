import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../service';
import toast from 'react-hot-toast';

export const useCreateCommunityCompetition = (communityId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (competitionData) => communityService.createCommunityCompetition(communityId, competitionData),
    onSuccess: () => {
      // Invalidate and refetch the competitions list so the new one appears
      queryClient.invalidateQueries({ queryKey: ['competitions', communityId] });
      toast.success('Competition created successfully! 🏆');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create competition';
      toast.error(message);
    },
  });
};