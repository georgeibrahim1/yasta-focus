import { useMutation, useQueryClient } from '@tanstack/react-query'
import { timerService } from '../service'
import { toast } from 'react-hot-toast'

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionName) => timerService.deleteSession(sessionName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session deleted')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete session'
      toast.error(message)
    }
  })
}
