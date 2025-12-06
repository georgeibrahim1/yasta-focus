import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '../service'
import { toast } from 'react-hot-toast'

export const useCreateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subjectData) => subjectService.createSubject(subjectData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast.success('Subject created successfully!')
      return data
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create subject'
      toast.error(message)
    }
  })
}
