import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'

export const useJoinCommunityCompetition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ communityId, competitionId, subjects }) => 
      communityService.joinCommunityCompetition(communityId, competitionId, { subjects }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityCompetitions', variables.communityId] })
      queryClient.invalidateQueries({ queryKey: ['communityCompetitionEntries', variables.communityId, variables.competitionId] })
    }
  })
}
