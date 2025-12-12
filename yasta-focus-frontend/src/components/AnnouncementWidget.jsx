import { useState } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../services/announcementServices'
import ProtectedComponent from './ProtectedComponent'

export default function AnnouncementWidget({ communityId, isManager }) {
  const [isCreating, setIsCreating] = useState(false)
  const [content, setContent] = useState('')
  
  const { data: announcements, isLoading } = useAnnouncements(communityId)
  const createAnnouncement = useCreateAnnouncement()
  const deleteAnnouncement = useDeleteAnnouncement()

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      await createAnnouncement.mutateAsync({
        communityId,
        announcementData: { content }
      })
      setContent('')
      setIsCreating(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement.mutateAsync(announcementId)
      } catch (error) {
        // Error handled by mutation
      }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Megaphone className="text-blue-600 dark:text-blue-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Announcements
          </h2>
        </div>
        
        <ProtectedComponent permissionCheck={() => isManager}>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus size={18} />
              New
            </button>
          )}
        </ProtectedComponent>
      </div>

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="mb-6 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            required
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setContent('')
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAnnouncement.isPending || !content.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {createAnnouncement.isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.announcement_id}
              className="border-l-4 border-blue-600 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-r-lg"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      {announcement.creator?.username || 'Unknown'}
                    </span>
                    <span>•</span>
                    <span>{formatDate(announcement.created_at)}</span>
                  </div>
                </div>
                
                <ProtectedComponent permissionCheck={() => isManager}>
                  <button
                    onClick={() => handleDelete(announcement.announcement_id)}
                    disabled={deleteAnnouncement.isPending}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 size={18} />
                  </button>
                </ProtectedComponent>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            No announcements yet
          </p>
        )}
      </div>
    </div>
  )
}
