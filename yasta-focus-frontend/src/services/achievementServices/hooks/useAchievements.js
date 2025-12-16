import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllAchievements,
  getUserAchievementStats
//   getAchievementsByCategory,
//   unlockAchievement
} from '../service';

// Get all achievements
export const useGetAllAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: getAllAchievements,
    staleTime: 0, 
  });
};

// Get user achievement stats
export const useGetAchievementStats = () => {
  return useQuery({
    queryKey: ['achievementStats'],
    queryFn: getUserAchievementStats,
    staleTime: 0,
  });
};
