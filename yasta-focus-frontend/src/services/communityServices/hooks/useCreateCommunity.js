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
      // Invalidate all communities queries using predicate to match all variations
      qc.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'communities'
      })
      toast.success('Community Created Successfully!')
      const unlocked = data?.data?.unlockedAchievements || []
      if (unlocked.length > 0) {
        // Refresh achievement queries
        qc.invalidateQueries({ queryKey: ['achievements'] })
        qc.invalidateQueries({ queryKey: ['achievementStats'] })
        qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'userProfile' })
        qc.invalidateQueries({ queryKey: ['user'] })
        // Show success with achievement info
          // Show achievement toasts
        unlocked.forEach(achievement => {
        toast.success(`🏆 ${achievement.title} (+${achievement.xp} XP)`, {
        duration: 4000,
      })
    })
      }
      return data
    },
    onError: (err) => {
      console.error('[useCreateCommunity] Error:', err)
      const message = err.response?.data?.message || err.message || 'Failed to create community'
      console.error('[useCreateCommunity] Error message:', message)
      toast.error(message)
    }
  })
}
