import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaderboardService } from '../service'
import toast from 'react-hot-toast'

export const useSendFriendRequest = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (userId) => leaderboardService.sendFriendRequest(userId),
    onSuccess: (data) => {  // ← Add 'data' parameter here
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
              toast.success('Friend request sent!')
      const unlocked = data?.data?.unlockedAchievements || []
      if (unlocked.length > 0) {
        // Refresh achievement queries
        qc.invalidateQueries({ queryKey: ['achievements'] })
        qc.invalidateQueries({ queryKey: ['achievementStats'] })
        
        // Show achievement toasts
      unlocked.forEach(achievement => {
      toast.success(`🏆 ${achievement.title} (+${achievement.xp} XP)`, {
        duration: 4000,
      })})
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send friend request')
    }
  })
}