import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaderboardService } from '../service'
import toast from 'react-hot-toast'

export const useSendFriendRequest = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (userId) => leaderboardService.sendFriendRequest(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
      toast.success('Friend request sent!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send friend request')
    }
  })
}
