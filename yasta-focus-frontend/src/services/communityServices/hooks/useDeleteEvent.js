import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api'
import { toast } from 'react-hot-toast'

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId) => {
      const response = await api.delete(`/api/events/${eventId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete event')
    }
  })
}
