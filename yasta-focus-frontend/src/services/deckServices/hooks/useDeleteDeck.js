import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deckService } from '../service'
import toast from 'react-hot-toast'

export const useDeleteDeck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, deckTitle }) => 
      deckService.deleteDeck(subjectName, deckTitle),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decks', variables.subjectName] })
      toast.success('Deck deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete deck')
    }
  })
}
