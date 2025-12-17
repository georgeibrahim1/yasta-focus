import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfile, updateUserProfile, getMe } from '../service'

export const useGetUserProfile = (userId) => {
  return useQuery({
    queryKey: userId ? ['userProfile', userId] : ['userProfile', 'me'],
    queryFn: () => getUserProfile(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Invalidate all user-related queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.setQueryData(['user'], (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            user: data
          }
        }
        return oldData
      })
    },
  })
}

export const useGetMe = () => {
  return useQuery({
    queryKey: ['userProfile', 'me'],
    queryFn: getMe,
    staleTime: 60000,
  })
}
