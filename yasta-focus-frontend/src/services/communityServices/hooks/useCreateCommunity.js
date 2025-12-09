import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'
import toast from 'react-hot-toast'

export const useCreateCommunity = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data) => communityService.createCommunity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities', 'joined'] })
      toast.success('Community created successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create community')
    }
  })
}
