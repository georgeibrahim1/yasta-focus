import { useQuery } from '@tanstack/react-query'
import { deckService } from '../service'

export const useGetDecks = (subjectName) => {
  return useQuery({
    queryKey: ['decks', subjectName],
    queryFn: () => deckService.getDecks(subjectName),
    enabled: !!subjectName
  })
}
