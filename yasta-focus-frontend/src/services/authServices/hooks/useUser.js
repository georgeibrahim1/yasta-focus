import { useQuery } from '@tanstack/react-query'
import { authService } from '../service'

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}
