import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import StudyRoomCard from './StudyRoomCard'
import CreateRoomModal from './CreateRoomModal'
import { useStudyRooms } from '../services/studyRoomServices'

export default function StudyRoomList({ communityId }) {
  const [search, setSearch] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: rooms, isLoading, error } = useStudyRooms(communityId, search)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load study rooms</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Create */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search study rooms..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus size={20} />
          Create Room
        </button>
      </div>

      {/* Rooms Grid */}
      {rooms && rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <StudyRoomCard key={room.room_code} room={room} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {search ? 'No rooms found matching your search' : 'No study rooms yet'}
          </p>
          {!search && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create the first room
            </button>
          )}
        </div>
      )}

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <CreateRoomModal
          communityId={communityId}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  )
}
