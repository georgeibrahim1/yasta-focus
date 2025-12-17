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
    queryFn: async () => {
      console.log('[usePendingRequests] Fetching for communityId:', communityId)
      const data = await communityService.getPendingRequests(communityId)
      console.log('[usePendingRequests] Received data:', data)
      // Ensure we always return an array
      const result = Array.isArray(data) ? data : []
      console.log('[usePendingRequests] Returning:', result)
      return result
    },
    enabled: !!communityId && enabled
  })
}

export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, memberId }) => {
      console.log('[useApproveJoinRequest] Approving:', { communityId, memberId })
      return communityService.approveJoinRequest(communityId, memberId)
    },
    onMutate: async ({ communityId, memberId }) => {
      console.log('[useApproveJoinRequest] onMutate:', { communityId, memberId })
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pendingRequests', communityId] })
      
      // Snapshot previous value
      const previousPending = queryClient.getQueryData(['pendingRequests', communityId])
      console.log('[useApproveJoinRequest] Previous pending:', previousPending)
      
      // Optimistically update by removing from pending list
      queryClient.setQueryData(['pendingRequests', communityId], (old) => {
        console.log('[useApproveJoinRequest] Old data in setQueryData:', old)
        if (!old) return []
        const filtered = old.filter(member => member.user_id !== memberId)
        console.log('[useApproveJoinRequest] Filtered data:', filtered)
        return filtered
      })
      
      return { previousPending }
    },
    onSuccess: (data, variables) => {
      console.log('[useApproveJoinRequest] onSuccess:', data)
    },
    onError: (err, variables, context) => {
      console.error('[useApproveJoinRequest] Error:', err)
      // Revert on error
      if (context?.previousPending) {
        console.log('[useApproveJoinRequest] Reverting to:', context.previousPending)
        queryClient.setQueryData(['pendingRequests', variables.communityId], context.previousPending)
      }
    },
    onSettled: (data, error, variables) => {
      console.log('[useApproveJoinRequest] onSettled - invalidating community members')
      // Only invalidate community members to update the accepted members list
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
      
      // Handle achievements if any
      if (data?.data?.unlockedAchievements?.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
        queryClient.invalidateQueries({ queryKey: ['achievementStats'] })
      }
    }
  })
}

export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, memberId }) => {
      console.log('[useRejectJoinRequest] Rejecting:', { communityId, memberId })
      return communityService.rejectJoinRequest(communityId, memberId)
    },
    onMutate: async ({ communityId, memberId }) => {
      console.log('[useRejectJoinRequest] onMutate:', { communityId, memberId })
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pendingRequests', communityId] })
      
      // Snapshot previous value
      const previousPending = queryClient.getQueryData(['pendingRequests', communityId])
      console.log('[useRejectJoinRequest] Previous pending:', previousPending)
      
      // Optimistically update by removing from pending list
      queryClient.setQueryData(['pendingRequests', communityId], (old) => {
        console.log('[useRejectJoinRequest] Old data in setQueryData:', old)
        if (!old) return []
        const filtered = old.filter(member => member.user_id !== memberId)
        console.log('[useRejectJoinRequest] Filtered data:', filtered)
        return filtered
      })
      
      return { previousPending }
    },
    onSuccess: (data, variables) => {
      console.log('[useRejectJoinRequest] onSuccess:', data)
    },
    onError: (err, variables, context) => {
      console.error('[useRejectJoinRequest] Error:', err)
      // Revert on error
      if (context?.previousPending) {
        console.log('[useRejectJoinRequest] Reverting to:', context.previousPending)
        queryClient.setQueryData(['pendingRequests', variables.communityId], context.previousPending)
      }
    }
    // No onSuccess invalidation - optimistic update is enough
  })
}
