import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetAllTags = () => {
  return useQuery({
    queryKey: ['community-tags'],
    queryFn: () => communityService.getAllTags(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}
