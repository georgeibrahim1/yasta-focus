import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateRoom } from '../services/studyRoomServices'

export default function CreateRoomModal({ communityId, onClose }) {
  const [roomName, setRoomName] = useState('')
  const createRoom = useCreateRoom()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!roomName.trim()) return

    try {
      await createRoom.mutateAsync({
        communityId,
        roomData: { room_name: roomName }
      })
      onClose()
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Create Study Room
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="roomName"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., Quantum Physics Deep Dive"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              required
              autoFocus
            />
          </div>

          {/* Error Message */}
          {createRoom.isError && (
            <p className="text-sm text-red-400">
              {createRoom.error?.response?.data?.message || 'Failed to create room'}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRoom.isPending || !roomName.trim()}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {createRoom.isPending ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
