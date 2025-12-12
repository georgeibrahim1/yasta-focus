import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
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
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['checkInStatus'] })
    },
  })
}
