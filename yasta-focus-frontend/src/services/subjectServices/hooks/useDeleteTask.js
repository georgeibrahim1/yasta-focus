import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../service'
import toast from 'react-hot-toast'

export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, taskTitle }) => taskService.deleteTask(subjectName, taskTitle),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.subjectName] })
      toast.success('Task deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    }
  })
}
