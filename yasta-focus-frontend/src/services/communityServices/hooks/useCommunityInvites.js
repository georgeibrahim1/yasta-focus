import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'
import toast from 'react-hot-toast'

export const useAddMemberByUsername = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, username }) => 
      communityService.addMemberByUsername(communityId, username),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] })
      toast.success(data.message || 'Member added successfully')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to add member'
      toast.error(message)
    }
  })
}

export const useInviteFriendToCommunity = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, friendId }) => 
      communityService.inviteFriendToCommunity(communityId, friendId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests', variables.communityId] })
      toast.success(data.message || 'Friend invited successfully')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to invite friend'
      toast.error(message)
    }
  })
}
