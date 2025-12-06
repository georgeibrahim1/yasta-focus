import { useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardService } from '../service'
import toast from 'react-hot-toast'

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, deckTitle, question }) => 
      flashcardService.deleteFlashcard(subjectName, deckTitle, question),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', variables.subjectName, variables.deckTitle] })
      toast.success('Flashcard deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete flashcard')
    }
  })
}
