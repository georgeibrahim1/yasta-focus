import { useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardService } from '../service'
import toast from 'react-hot-toast'

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, deckTitle, question, updateData }) => 
      flashcardService.updateFlashcard(subjectName, deckTitle, question, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', variables.subjectName, variables.deckTitle] })
      toast.success('Flashcard updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update flashcard')
    }
  })
}
