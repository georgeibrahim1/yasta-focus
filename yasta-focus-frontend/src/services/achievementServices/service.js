import { api } from '../api';

// Get all achievements with user progress
export const getAllAchievements = async () => {
  const response = await api.get('/api/achievements');
  return response.data.data.achievements;
};

// Get user achievement stats (level, XP, unlocked count)
export const getUserAchievementStats = async () => {
  const response = await api.get('/api/achievements/stats');
  return response.data.data;
};
