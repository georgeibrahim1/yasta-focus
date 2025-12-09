import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'
import toast from 'react-hot-toast'

export const useCreateCommunity = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data) => {
      console.log('[useCreateCommunity] Sending data:', data)
      return communityService.createCommunity(data)
    },
    onSuccess: (data) => {
      console.log('[useCreateCommunity] Success:', data)
      qc.invalidateQueries({ queryKey: ['communities'] })
      qc.invalidateQueries({ queryKey: ['communities', 'joined'] })
      toast.success('Community created successfully')
    },
    onError: (err) => {
      console.error('[useCreateCommunity] Error:', err)
      const message = err.response?.data?.message || err.message || 'Failed to create community'
      console.error('[useCreateCommunity] Error message:', message)
      toast.error(message)
    }
  })
}
