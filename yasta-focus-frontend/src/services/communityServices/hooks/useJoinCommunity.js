import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'
import toast from 'react-hot-toast'

export const useJoinCommunity = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ communityId, payload }) => communityService.requestJoin(communityId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] })
      qc.invalidateQueries({ queryKey: ['communities', 'joined'] })
      toast.success('Join request sent')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send join request')
    }
  })
}
