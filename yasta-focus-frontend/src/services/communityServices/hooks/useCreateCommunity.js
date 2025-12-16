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
      const unlocked = data?.data?.unlockedAchievements || []
      if (unlocked.length > 0) {
        // Refresh achievement queries
        qc.invalidateQueries({ queryKey: ['achievements'] })
        qc.invalidateQueries({ queryKey: ['achievementStats'] })
        
        // Dispatch event for global notification system
        // window.dispatchEvent(
        //   new CustomEvent('achievements-unlocked', { 
        //     detail: unlocked 
        //   })
        // )
        
        // Show success with achievement info
        const totalXP = unlocked.reduce((sum, a) => sum + a.xp, 0)
        toast.success(`Community created! +${totalXP} XP from ${unlocked.length} achievement(s)! 🎉`)
      } else {
        toast.success('Community Created Successfully!')
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
