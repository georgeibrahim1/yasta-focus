import { useMutation, useQueryClient } from '@tanstack/react-query'
import { timerService } from '../service'
import { toast } from 'react-hot-toast'

export const useCreateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionData) => timerService.createSession(sessionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      // Invalidate user data to show updated XP immediately
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      // Invalidate tasks if a task was associated (status might have changed to In Progress)
      if (variables.task_title && variables.subject_name) {
        queryClient.invalidateQueries({ queryKey: ['tasks', variables.subject_name] })
      }
      toast.success('Session created! Great work! 🎉')
      const unlocked = data?.data?.unlockedAchievements || []
      console.log(unlocked);
      if (unlocked.length > 0) {
        // Refresh achievement queries
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
        queryClient.invalidateQueries({ queryKey: ['achievementStats'] })
  
        // Show achievement toasts
      unlocked.forEach(achievement => {
      toast.success(`🏆 ${achievement.title} (+${achievement.xp} XP)`, {
        duration: 4000,
      })
    })}
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create session'
      toast.error(message)
      console.error('Create session error:', error)
    }
  })
}
