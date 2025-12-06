import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deckService } from '../service'
import toast from 'react-hot-toast'

export const useCreateDeck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subjectName, deckData }) => deckService.createDeck(subjectName, deckData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decks', variables.subjectName] })
      toast.success('Deck created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create deck')
    }
  })
}
