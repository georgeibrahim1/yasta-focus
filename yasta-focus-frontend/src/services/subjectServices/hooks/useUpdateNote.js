import { useMutation, useQueryClient } from '@tanstack/react-query'
import { noteService } from '../service'

export const useUpdateNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, noteTitle, updateData }) => 
      noteService.updateNote(subjectName, noteTitle, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.subjectName] })
      queryClient.invalidateQueries({ queryKey: ['note', variables.subjectName, variables.noteTitle] })
    }
  })
}
