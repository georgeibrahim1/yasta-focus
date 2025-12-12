import {api} from '../api'

export const getAnnouncements = async (communityId) => {
  const response = await api.get(`/api/communities/${communityId}/announcements`)
  return response.data.data.announcements
}

export const createAnnouncement = async (communityId, announcementData) => {
  const response = await api.post(`/api/communities/${communityId}/announcements`, announcementData)
  return response.data.data.announcement
}

export const deleteAnnouncement = async (announcementNum, moderatorId, communityId) => {
  const response = await api.delete(`/api/announcements/${announcementNum}/${moderatorId}/${communityId}`)
  return response.data
}
