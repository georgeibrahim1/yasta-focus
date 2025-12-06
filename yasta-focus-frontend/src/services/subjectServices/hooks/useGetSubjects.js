import { useQuery } from '@tanstack/react-query'
import { subjectService } from '../service'

export const useGetSubjects = (options = {}) => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  })
}
