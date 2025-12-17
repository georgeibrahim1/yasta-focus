import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  getFriends,
  getFriendRequests,
  getSentRequests,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
  giveXPToFriend
} from '../service'

export const useGetFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
    staleTime: 30000,
  })
}

export const useGetFriendRequests = () => {
  return useQuery({
    queryKey: ['friendRequests'],
    queryFn: getFriendRequests,
    staleTime: 30000,
  })
}

export const useGetSentRequests = () => {
  return useQuery({
    queryKey: ['sentRequests'],
    queryFn: getSentRequests,
    staleTime: 30000,
  })
}

export const useRespondToFriendRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: respondToFriendRequest,
    onMutate: async ({ requesterId, action }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['friendRequests'] })
      
      // Snapshot previous value
      const previousRequests = queryClient.getQueryData(['friendRequests'])
      
      // Optimistically remove from requests list
      queryClient.setQueryData(['friendRequests'], (old) => {
        if (!old) return old
        return old.filter(request => request.user_id !== requesterId)
      })
      
      return { previousRequests }
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousRequests) {
        queryClient.setQueryData(['friendRequests'], context.previousRequests)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['competitionLeaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['globalCompetitionLeaderboard'] })
      toast.success('Request Accepted!')
      const unlockedData = data?.data?.unlockedAchievements || {}
      const allUnlocked = [...(unlockedData.requester || []), ...(unlockedData.requestee || [])]
      console.log('Unlocked achievements:', allUnlocked);
      if (allUnlocked.length > 0) {
        // Refresh achievement queries
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
        queryClient.invalidateQueries({ queryKey: ['achievementStats'] })
        queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'userProfile' })
        queryClient.invalidateQueries({ queryKey: ['user'] })
  
        // Show achievement toasts
        allUnlocked.forEach(achievement => {
          toast.success(`🏆 ${achievement.title} (+${achievement.xp} XP)`, {
            duration: 4000,
          })
        })
      }
    },
  })
}

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: cancelFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentRequests'] })
    },
  })
}

export const useRemoveFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export const useGiveXPToFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: giveXPToFriend,
    onSuccess: () => {
      // Refresh friends list (to show updated XP for receiver)
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      // Refresh check-in status (to disable button)
      queryClient.invalidateQueries({ queryKey: ['checkInStatus'] })
      // Refresh current user data (to show updated XP for giver)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })
}
