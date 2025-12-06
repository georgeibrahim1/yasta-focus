import { useMutation, useQueryClient } from '@tanstack/react-query'
import { timerService } from '../service'
import { toast } from 'react-hot-toast'

export const useCompleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionName, updateData }) => 
      timerService.updateSession(sessionName, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['sessionStats'] })
      toast.success('Session completed! Great work! 🎉')
      return data
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to complete session'
      toast.error(message)
    }
  })
}
