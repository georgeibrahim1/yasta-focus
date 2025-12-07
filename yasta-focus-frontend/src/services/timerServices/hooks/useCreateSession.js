import { useMutation, useQueryClient } from '@tanstack/react-query'
import { timerService } from '../service'
import { toast } from 'react-hot-toast'

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionData) => timerService.createSession(sessionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      // Invalidate tasks if a task was associated (status might have changed to In Progress)
      if (variables.task_title && variables.subject_name) {
        queryClient.invalidateQueries({ queryKey: ['tasks', variables.subject_name] })
      }
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
