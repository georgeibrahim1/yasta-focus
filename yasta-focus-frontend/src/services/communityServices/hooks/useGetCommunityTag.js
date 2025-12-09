// hooks/useGetTags.js
import { useQuery } from '@tanstack/react-query'
import { communityService } from '../service'

export const useGetTags = (communityId) => {

  const queryResult = useQuery({
    queryKey: ['tags', communityId],
    queryFn: () => {
      return communityService.getTags(communityId)
    },
    enabled: !!communityId
  })
  return queryResult
}
