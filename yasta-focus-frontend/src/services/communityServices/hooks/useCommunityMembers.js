import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'

export const useCommunityMembers = (communityId) => {
  return useQuery({
    queryKey: ['communityMembers', communityId],
    queryFn: () => communityService.getCommunityMembers(communityId),
    enabled: !!communityId
  })
}

export const useKickMember = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, memberId }) => 
      communityService.removeMember(communityId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
    }
  })
}

export const usePromoteMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ communityId, memberId }) => communityService.promoteMember(communityId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
    }
  })
}

export const useDemoteMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ communityId, memberId }) => communityService.demoteMember(communityId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
    }
  })
}

export const usePendingRequests = (communityId, enabled = false) => {
  return useQuery({
    queryKey: ['pendingRequests', communityId],
    queryFn: () => communityService.getPendingRequests(communityId),
    enabled: !!communityId && enabled
  })
}

export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, memberId }) => 
      communityService.approveJoinRequest(communityId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.communityId] })
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
    }
  })
}

export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, memberId }) => 
      communityService.rejectJoinRequest(communityId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.communityId] })
    }
  })
}
