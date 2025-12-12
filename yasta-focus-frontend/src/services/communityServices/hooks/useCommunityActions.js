import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'

export const useUpdateCommunityInfo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, communityData }) => 
      communityService.updateCommunityInfo(communityId, communityData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
    }
  })
}

export const useDeleteCommunity = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (communityId) => 
      communityService.deleteCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
    }
  })
}

export const useUpdateMemberBio = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, bio }) => 
      communityService.updateMemberBio(communityId, bio),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
    }
  })
}

export const useExitCommunity = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: communityService.exitCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
    }
  })
}

export const useRemoveMember = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, memberId }) => 
      communityService.removeMember(communityId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] })
    }
  })
}
