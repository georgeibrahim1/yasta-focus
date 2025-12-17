import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../service'
import toast from 'react-hot-toast'

export const useJoinCompetition = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ competitionId, payload }) => communityService.joinCompetition(competitionId, payload),
    onMutate: async ({ competitionId }) => {
      console.log('[useJoinCompetition] onMutate', competitionId)
      await qc.cancelQueries({ queryKey: ['competitions', 'all'] })
      const previous = qc.getQueryData(['competitions', 'all'])

      if (previous) {
        const next = previous.map(c => {
          if (String(c.id) === String(competitionId)) {
            return { ...c, joined: 'pending' }
          }
          return c
        })
        qc.setQueryData(['competitions', 'all'], next)
      } else {
        console.log('[useJoinCompetition] no previous competitions cache found')
      }

      return { previous }
    },
    onError: (err, variables, context) => {
      console.error('[useJoinCompetition] onError', err)
      if (context?.previous) {
        qc.setQueryData(['competitions', 'all'], context.previous)
      }
      toast.error(err.response?.data?.message || 'Failed to join competition')
    },
    onSuccess: (data, variables) => {
      console.log('[useJoinCompetition] onSuccess', variables.competitionId)
      toast.success('Successfully joined competition')
      // Invalidate to refetch and show updated status
      qc.invalidateQueries({ queryKey: ['competitions', 'all'] })
    }
  })
}
