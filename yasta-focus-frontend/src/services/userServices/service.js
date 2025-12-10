import {api} from '../api'

export const getUserProfile = async (userId) => {
  const url = userId ? `/api/users/${userId}` : '/api/users/me'
  const response = await api.get(url)
  return response.data.data.user
}

export const updateUserProfile = async (userData) => {
  const response = await api.patch('/api/users/me', userData)
  return response.data.data.user
}

export const getMe = async () => {
  const response = await api.get('/api/users/me')
  return response.data.data.user
}
