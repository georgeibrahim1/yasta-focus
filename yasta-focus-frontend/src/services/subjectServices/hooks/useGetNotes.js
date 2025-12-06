import { useQuery } from '@tanstack/react-query'
import { noteService } from '../service'

export const useGetNotes = (subjectName, options = {}) => {
  return useQuery({
    queryKey: ['notes', subjectName],
    queryFn: () => noteService.getNotes(subjectName),
    enabled: !!subjectName,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options
  })
}
