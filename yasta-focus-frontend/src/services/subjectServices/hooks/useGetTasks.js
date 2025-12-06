import { useQuery } from '@tanstack/react-query'
import { taskService } from '../service'

export const useGetTasks = (subjectName, options = {}) => {
  return useQuery({
    queryKey: ['tasks', subjectName],
    queryFn: () => taskService.getTasks(subjectName),
    enabled: !!subjectName,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  })
}
