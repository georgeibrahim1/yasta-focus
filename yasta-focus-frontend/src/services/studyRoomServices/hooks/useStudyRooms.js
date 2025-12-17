import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as studyRoomService from '../service'

export const useStudyRooms = (communityId, search = '') => {
  return useQuery({
    queryKey: ['studyRooms', communityId, search],
    queryFn: () => studyRoomService.getCommunityRooms(communityId, search),
    enabled: !!communityId
  })
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, roomData }) => 
      studyRoomService.createRoom(communityId, roomData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studyRooms', variables.communityId] })
      toast.success('Study room created successfully! 🎥')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create study room'
      toast.error(message)
    }
  })
}

export const useDeleteRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: studyRoomService.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyRooms'] })
    }
  })
}

export const useJoinRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: studyRoomService.joinRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyRooms'] })
    }
  })
}

export const useLeaveRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: studyRoomService.leaveRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyRooms'] })
    }
  })
}
