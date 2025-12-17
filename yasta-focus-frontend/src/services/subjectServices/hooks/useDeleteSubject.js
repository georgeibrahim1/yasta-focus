import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '../service'

export const useDeleteSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectName) => subjectService.deleteSubject(subjectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    }
  })
}
