import { useMutation, useQueryClient } from '@tanstack/react-query'
import { noteService } from '../service'
import { toast } from 'react-hot-toast'

export const useCreateNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, noteData }) => noteService.createNote(subjectName, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.subjectName] })
      toast.success('Note created successfully!')
      return data
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create note'
      toast.error(message)
    }
  })
}
