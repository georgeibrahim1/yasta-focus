import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
