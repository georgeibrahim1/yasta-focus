import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'

export const useCreateCommunityCompetition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ communityId, competitionData }) => 
      communityService.createCommunityCompetition(communityId, competitionData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityCompetitions', variables.communityId] })
    }
  })
}
