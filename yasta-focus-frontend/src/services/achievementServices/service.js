// services/achievementServices/service.js
import { api } from '../api';

// Regular user endpoints
export const getAllAchievements = async () => {
  const response = await api.get('/api/achievements');
  return response.data.data.achievements;
};

export const getUserAchievementStats = async () => {
  const response = await api.get('/api/achievements/stats');
  return response.data.data;
};

// Admin endpoints
export const getAdminAchievements = async () => {
  const response = await api.get('/api/achievements/admin/all');
  return response.data.data.achievements;
};

export const createAchievement = async (achievementData) => {
  const response = await api.post('/api/achievements/admin', achievementData);
  return response.data;
};

export const updateAchievement = async ({ id, achievementData }) => {
  const response = await api.put(`/api/achievements/admin/${id}`, achievementData);
  return response.data;
};

export const deleteAchievement = async (id) => {
  const response = await api.delete(`/api/achievements/admin/${id}`);
  return response.data;
};