import { useMutation, useQueryClient } from '@tanstack/react-query'
import { flashcardService } from '../service'
import toast from 'react-hot-toast'

export const useUpdateFlashcardConfidence = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, deckTitle, question, confidence }) => 
      flashcardService.updateFlashcardConfidence(subjectName, deckTitle, question, confidence),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', variables.subjectName, variables.deckTitle] })
      
      const confidenceMessages = {
        0: 'Again - card reset',
        1: 'Hard - progress decreased',
        2: 'Good - progress increased',
        3: 'Easy - great progress!'
      }
      toast.success(confidenceMessages[variables.confidence] || 'Flashcard updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update confidence')
    }
  })
}
