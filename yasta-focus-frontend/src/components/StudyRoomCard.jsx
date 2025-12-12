import { Users, Trash2 } from 'lucide-react'
import { useDeleteRoom, useJoinRoom, useLeaveRoom } from '../services/studyRoomServices'
import { useUser } from '../services/authServices'

export default function StudyRoomCard({ room }) {
  const { data: currentUser } = useUser()
  const deleteRoom = useDeleteRoom()
  const joinRoom = useJoinRoom()
  const leaveRoom = useLeaveRoom()

  const userId = currentUser?.data?.user?.user_id || currentUser?.user?.user_id || currentUser?.user_id
  const isCreator = room.student_creator === userId
  const isMember = room.members?.some(member => member.user_id === userId)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this study room?')) {
      try {
        await deleteRoom.mutateAsync(room.room_code)
      } catch (error) {
        console.error('Failed to delete room:', error)
      }
    }
  }

  const handleJoin = async () => {
    try {
      await joinRoom.mutateAsync(room.room_code)
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this study room?')) {
      try {
        await leaveRoom.mutateAsync(room.room_code)
      } catch (error) {
        console.error('Failed to leave room:', error)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {room.room_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Created by {room.creator?.username || 'Unknown'}
          </p>
        </div>
        
        {isCreator && (
          <button
            onClick={handleDelete}
            disabled={deleteRoom.isPending}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete room"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Users size={16} />
        <span>{room.members?.length || 0} members</span>
      </div>

      {!isMember && !isCreator && (
        <button
          onClick={handleJoin}
          disabled={joinRoom.isPending}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {joinRoom.isPending ? 'Joining...' : 'Join Room'}
        </button>
      )}

      {isMember && !isCreator && (
        <button
          onClick={handleLeave}
          disabled={leaveRoom.isPending}
          className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {leaveRoom.isPending ? 'Leaving...' : 'Leave Room'}
        </button>
      )}

      {isCreator && (
        <div className="py-2 px-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg text-center text-sm font-medium">
          You created this room
        </div>
      )}
    </div>
  )
}
