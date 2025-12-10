import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'
import toast from 'react-hot-toast'

export const useLeaveCommunity = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (communityId) => communityService.leaveCommunity(communityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] })
      toast.success('Left community successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to leave community')
    }
  })
}
