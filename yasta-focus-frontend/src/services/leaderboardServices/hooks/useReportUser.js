import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leaderboardService } from '../service'
import toast from 'react-hot-toast'

export const useReportUser = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, title, description }) => leaderboardService.reportUser(userId, title, description),
    onSuccess: () => {
      toast.success('Report submitted successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit report')
    }
  })
}
