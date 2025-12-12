import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaderboardService } from '../service'
import toast from 'react-hot-toast'

export const useCheckInStatus = (toUserId) => {
  return useQuery({
    queryKey: ['checkInStatus', toUserId],
    queryFn: () => leaderboardService.getCheckInStatus(toUserId),
    enabled: !!toUserId
  })
}

export const useGiveXP = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, rank }) => {
      console.log('useGiveXP mutation called with:', { userId, rank })
      return leaderboardService.giveXP(userId, rank)
    },
    onSuccess: (data) => {
      console.log('useGiveXP success:', data)
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
      qc.invalidateQueries({ queryKey: ['checkInStatus'] })
      toast.success(`You gave ${data.data.amountGiven} XP!`)
    },
    onError: (err) => {
      console.error('useGiveXP error:', err)
      toast.error(err.response?.data?.message || 'Failed to give XP')
    }
  })
}
