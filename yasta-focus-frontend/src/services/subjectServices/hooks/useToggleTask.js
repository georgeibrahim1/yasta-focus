import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../service'
import { toast } from 'react-hot-toast'

export const useToggleTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, taskTitle }) => taskService.toggleTask(subjectName, taskTitle),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.subjectName] })
      // Invalidate user data to show updated XP immediately
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update task'
      toast.error(message)
    }
  })
}
