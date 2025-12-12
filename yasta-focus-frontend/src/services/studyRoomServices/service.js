import {api} from '../api'

export const getCommunityRooms = async (communityId, search = '') => {
  const params = search ? { search } : {}
  const response = await api.get(`/api/communities/${communityId}/rooms`, { params })
  return response.data.data.rooms
}

export const createRoom = async (communityId, roomData) => {
  const response = await api.post(`/api/communities/${communityId}/rooms`, roomData)
  return response.data.data.room
}

export const deleteRoom = async (roomCode) => {
  const response = await api.delete(`/api/rooms/${roomCode}`)
  return response.data
}

export const joinRoom = async (roomCode) => {
  const response = await api.post(`/api/rooms/${roomCode}/join`)
  return response.data
}

export const leaveRoom = async (roomCode) => {
  const response = await api.delete(`/api/rooms/${roomCode}/leave`)
  return response.data
}
