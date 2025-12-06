import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../service'
import toast from 'react-hot-toast'

export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, taskData }) => taskService.createTask(subjectName, taskData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.subjectName] })
      toast.success('Task created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    }
  })
}
