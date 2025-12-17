// services/achievementServices/hooks/useAdminAchievements.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getAdminAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement
} from '../service';

export const useAdminAchievements = () => {
  return useQuery({
    queryKey: ['adminAchievements'],
    queryFn: getAdminAchievements
  });
};

export const useCreateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAchievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Achievement created successfully! 🎉');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create achievement');
    }
  });
};

export const useUpdateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAchievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Achievement updated successfully! ✅');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update achievement');
    }
  });
};

export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAchievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Achievement deleted successfully! 🗑️');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete achievement');
    }
  });
};