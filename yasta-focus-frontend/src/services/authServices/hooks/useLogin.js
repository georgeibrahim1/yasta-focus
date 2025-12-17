import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authService } from '../service'

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Force refetch
      navigate('/');
    },
  })
}
