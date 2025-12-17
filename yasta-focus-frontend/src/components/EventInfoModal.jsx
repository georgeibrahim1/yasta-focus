import React from 'react'
import { X, Trash2 } from 'lucide-react'
import { useDeleteEvent } from '../services/communityServices'
import { useUser } from '../services/authServices'

export default function EventInfoModal({ event, isOpen, onClose }) {
  const { data: currentUser } = useUser()
  const deleteEvent = useDeleteEvent()
  
  const isAdmin = currentUser?.user?.role === 0
  
  if (!isOpen || !event) return null

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }
    
    try {
      await deleteEvent.mutateAsync(event.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{event.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-400 mb-2 block">Event Date</label>
            <p className="text-white">{new Date(event.date).toLocaleString()}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Description</label>
            <p className="text-slate-300 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-between items-center">
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 border border-red-600/30"
            >
              <Trash2 size={16} />
              {deleteEvent.isPending ? 'Deleting...' : 'Delete Event'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
