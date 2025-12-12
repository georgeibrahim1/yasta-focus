import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'

export const useDeleteCommunityCompetition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ communityId, competitionId }) => 
      communityService.deleteCommunityCompetition(communityId, competitionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityCompetitions', variables.communityId] })
    }
  })
}
