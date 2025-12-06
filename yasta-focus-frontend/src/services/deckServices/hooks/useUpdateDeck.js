import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deckService } from '../service'
import toast from 'react-hot-toast'

export const useUpdateDeck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, deckTitle, updateData }) => 
      deckService.updateDeck(subjectName, deckTitle, updateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decks', variables.subjectName] })
      toast.success('Deck updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update deck')
    }
  })
}
