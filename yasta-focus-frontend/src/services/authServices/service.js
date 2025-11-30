import { api } from "../api"

export const authService = {
  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.get('/auth/logout');
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await api.patch('/auth/updateMyPassword', data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgotPassword', { email });
    return response.data;
  },

  resetPassword: async (token, data) => {
    const response = await api.patch(`/auth/resetPassword/${token}`, data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
}