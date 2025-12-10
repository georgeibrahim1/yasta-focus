import { useQuery } from '@tanstack/react-query'
import { authService } from '../service'

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getMe,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })
}
