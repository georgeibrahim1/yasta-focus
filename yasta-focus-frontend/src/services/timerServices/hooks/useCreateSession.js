import { useMutation, useQueryClient } from '@tanstack/react-query'
import { timerService } from '../service'
import { toast } from 'react-hot-toast'

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionData) => timerService.createSession(sessionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      // Invalidate tasks if a task was associated (status might have changed to In Progress)
      if (variables.task_title && variables.subject_name) {
        queryClient.invalidateQueries({ queryKey: ['tasks', variables.subject_name] })
      }

      const unlocked = data?.data?.unlockedAchievements || []
      if (unlocked.length > 0) {
        // Refresh achievement queries
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
        queryClient.invalidateQueries({ queryKey: ['achievementStats'] })
        
        // Dispatch event for global notification system
        // window.dispatchEvent(
        //   new CustomEvent('achievements-unlocked', { 
        //     detail: unlocked 
        //   })
        // )
        
        // Show success with achievement info
        const totalXP = unlocked.reduce((sum, a) => sum + a.xp, 0)
        toast.success(`Session created! +${totalXP} XP from ${unlocked.length} achievement(s)! 🎉`)
      } else {
        toast.success('Session created! Great work! 🎉')
      }
      return data
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create session'
      toast.error(message)
      console.error('Create session error:', error)
    }
  })
}
