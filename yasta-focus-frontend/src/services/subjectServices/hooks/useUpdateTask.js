import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../service'

export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, taskTitle, updateData }) => 
      taskService.updateTask(subjectName, taskTitle, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.subjectName] })
    }
  })
}
