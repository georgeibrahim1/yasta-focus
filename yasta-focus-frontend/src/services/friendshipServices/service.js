import {api} from '../api'

export const getFriends = async () => {
  const response = await api.get('/api/friendships')
  return response.data.data.friends
}

export const getFriendRequests = async () => {
  const response = await api.get('/api/friendships/requests')
  return response.data.data.requests
}

export const getSentRequests = async () => {
  const response = await api.get('/api/friendships/sent')
  return response.data.data.sentRequests
}

export const respondToFriendRequest = async ({ requesterId, action }) => {
  const response = await api.patch(`/api/friendships/requests/${requesterId}`, { action })
  return response.data
}

export const cancelFriendRequest = async (requesteeId) => {
  const response = await api.delete(`/api/friendships/requests/${requesteeId}`)
  return response.data
}

export const removeFriend = async (friendId) => {
  const response = await api.delete(`/api/friendships/${friendId}`)
  return response.data
}

export const giveXPToFriend = async (friendId) => {
  const response = await api.post(`/api/friendships/${friendId}/give-xp`)
  return response.data
}
