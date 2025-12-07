import { useQuery } from '@tanstack/react-query'
import { deckService } from '../service'

export const useGetDeck = (subjectName, deckTitle) => {
  return useQuery({
    queryKey: ['deck', subjectName, deckTitle],
    queryFn: () => deckService.getDeck(subjectName, deckTitle),
    enabled: !!subjectName && !!deckTitle,
    staleTime: 0
  })
}
