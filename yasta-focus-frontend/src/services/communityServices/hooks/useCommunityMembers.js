import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'
import toast from 'react-hot-toast'

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
      toast.success('Request approved! Member added to community 🎉')
      const unlocked = data?.data?.unlockedAchievements || []
      if (unlocked.length > 0) {
        // Refresh achievement queries
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
        queryClient.invalidateQueries({ queryKey: ['achievementStats'] })
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'userProfile' })
        queryClient.invalidateQueries({ queryKey: ['user'] })
  
        // Show achievement toasts
        unlocked.forEach(achievement => {
          toast.success(`🏆 ${achievement.title} (+${achievement.xp} XP)`, {
            duration: 4000,
          })
        })
      }
    },
    onError: (err, variables, context) => {
      console.error('[useApproveJoinRequest] Error:', err)
      
      // Check if error is 404 (request already processed/deleted)
      const errorMessage = err?.response?.data?.message || err?.message
      const isNotFound = err?.response?.status === 404 || errorMessage?.includes('not found')
      
      if (isNotFound) {
        // Request already processed - just show a message and don't revert
        toast.error('This request has already been processed')
        // Invalidate to refresh the list
        queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.communityId] })
      } else {
        // Other error - revert the optimistic update
        toast.error(errorMessage || 'Failed to approve request')
        if (context?.previousPending) {
          console.log('[useApproveJoinRequest] Reverting to:', context.previousPending)
          queryClient.setQueryData(['pendingRequests', variables.communityId], context.previousPending)
        }
      }
    },
    onSettled: (data, error, variables) => {
      console.log('[useApproveJoinRequest] onSettled - invalidating community members')
      // Invalidate community members to update the accepted members list
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
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
      toast.success('Request rejected')
    },
    onError: (err, variables, context) => {
      console.error('[useRejectJoinRequest] Error:', err)
      
      // Check if error is 404 (request already processed/deleted)
      const errorMessage = err?.response?.data?.message || err?.message
      const isNotFound = err?.response?.status === 404 || errorMessage?.includes('not found')
      
      if (isNotFound) {
        // Request already processed - just show a message and don't revert
        toast.error('This request has already been processed')
        // Invalidate to refresh the list
        queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.communityId] })
      } else {
        // Other error - revert the optimistic update
        toast.error(errorMessage || 'Failed to reject request')
        if (context?.previousPending) {
          console.log('[useRejectJoinRequest] Reverting to:', context.previousPending)
          queryClient.setQueryData(['pendingRequests', variables.communityId], context.previousPending)
        }
      }
    },
    onSettled: (data, error, variables) => {
      // Refresh pending requests list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.communityId] })
    }
  })
}
