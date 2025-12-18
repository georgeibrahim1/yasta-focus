import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '../service'
import toast from 'react-hot-toast'

export const useDeleteSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectName) => subjectService.deleteSubject(subjectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast.success('Subject deleted successfully')
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Failed to delete subject'
      toast.error(errorMessage)
      console.error('Delete subject error:', error)
    }
  })
}
