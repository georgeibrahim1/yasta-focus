import { useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardService } from '../service'
import toast from 'react-hot-toast'

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, deckTitle, flashcardData }) => 
      flashcardService.createFlashcard(subjectName, deckTitle, flashcardData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', variables.subjectName, variables.deckTitle] })
      toast.success('Flashcard created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create flashcard')
    }
  })
}
