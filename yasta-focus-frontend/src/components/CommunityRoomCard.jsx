export default function CommunityRoomCard({
  roomId,
  title,
  tag,
  description,
  isOwner,
  isMember,
  memberCount,
  onJoinRoom,
  onDeleteRoom,
  onLeaveRoom,
}) {
  const handleJoinRoom = () => {
    if (onJoinRoom) {
      onJoinRoom(roomId);
    }
  };

  const handleDeleteRoom = () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      if (onDeleteRoom) {
        onDeleteRoom(roomId);
      }
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm(`Are you sure you want to leave "${title}"?`)) {
      if (onLeaveRoom) {
        onLeaveRoom(roomId);
      }
    }
  };

  return (
    <div className="w-full bg-gray-900 rounded-2xl shadow-xl p-6 hover:bg-gray-800 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">
              {tag}
            </span>
            {memberCount !== undefined && (
              <span className="text-sm text-gray-400">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons for Owner */}
        {isOwner && (
          <button
            onClick={handleDeleteRoom}
            className="text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg hover:bg-red-900/20"
          >
            Delete Room
          </button>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-300 mb-6">{description}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isMember ? (
          <>
            <button
              onClick={handleJoinRoom}
              className="flex-1 text-lg py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors"
            >
              Enter Room
            </button>
            {!isOwner && (
              <button
                onClick={handleLeaveRoom}
                className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Leave
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleJoinRoom}
            className="flex-1 text-lg py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Join Room
          </button>
        )}
      </div>
    </div>
  );
}
