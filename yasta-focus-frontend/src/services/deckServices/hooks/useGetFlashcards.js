import { useQuery } from '@tanstack/react-query'
import { flashcardService } from '../service'

export const useGetFlashcards = (subjectName, deckTitle) => {
  return useQuery({
    queryKey: ['flashcards', subjectName, deckTitle],
    queryFn: () => flashcardService.getFlashcards(subjectName, deckTitle),
    enabled: !!subjectName && !!deckTitle
  })
}
