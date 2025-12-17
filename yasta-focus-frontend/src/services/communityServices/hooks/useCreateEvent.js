import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createEvent } from '../service'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event created successfully! 📅')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create event'
      toast.error(message)
    },
  })
}
