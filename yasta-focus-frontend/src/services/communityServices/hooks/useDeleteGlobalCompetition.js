import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../service';

export const useDeleteGlobalCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (competitionId) =>
      communityService.deleteGlobalCompetition(competitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions', 'all'] });
    },
  });
};
