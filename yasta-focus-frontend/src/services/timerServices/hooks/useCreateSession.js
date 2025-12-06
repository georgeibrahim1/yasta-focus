import { useMutation, useQueryClient } from '@tanstack/react-query'
import { timerService } from '../service'
import { toast } from 'react-hot-toast'

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionData) => timerService.createSession(sessionData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session created successfully!')
      return data
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create session'
      toast.error(message)
      console.error('Create session error:', error)
    }
  })
}
