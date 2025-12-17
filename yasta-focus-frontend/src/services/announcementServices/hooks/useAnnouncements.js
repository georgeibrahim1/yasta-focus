import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as announcementService from '../service'

export const useAnnouncements = (communityId) => {
  return useQuery({
    queryKey: ['announcements', communityId],
    queryFn: () => announcementService.getAnnouncements(communityId),
    enabled: !!communityId
  })
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ communityId, announcementData }) => 
      announcementService.createAnnouncement(communityId, announcementData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements', variables.communityId] })
      toast.success('Announcement created successfully! 📢')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create announcement'
      toast.error(message)
    }
  })
}

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ announcementNum, moderatorId, communityId }) => 
      announcementService.deleteAnnouncement(announcementNum, moderatorId, communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    }
  })
}
