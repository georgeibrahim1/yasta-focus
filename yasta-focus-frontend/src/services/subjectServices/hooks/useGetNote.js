import { useQuery } from '@tanstack/react-query'
import { noteService } from '../service'

export const useGetNote = (subjectName, noteTitle, options = {}) => {
  return useQuery({
    queryKey: ['note', subjectName, noteTitle],
    queryFn: () => noteService.getNote(subjectName, noteTitle),
    enabled: !!subjectName && !!noteTitle,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  })
}
