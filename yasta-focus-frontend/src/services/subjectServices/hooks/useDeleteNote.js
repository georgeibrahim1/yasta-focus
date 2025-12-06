import { useMutation, useQueryClient } from '@tanstack/react-query'
import { noteService } from '../service'
import toast from 'react-hot-toast'

export const useDeleteNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, noteTitle }) => noteService.deleteNote(subjectName, noteTitle),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.subjectName] })
      toast.success('Note deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete note')
    }
  })
}
