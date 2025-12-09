import { useState } from 'react';


export default function CommunityRoomModal({ isOpen, onClose, onSubmit, loading, communityName }) {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await onSubmit({ room_name: roomName });
    
    // Reset form
    setRoomName('');
  };

  const handleClose = () => {
    setRoomName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
        <h2 className="text-3xl font-bold mb-2 text-white">Create Study Room</h2>
        {communityName && (
          <p className="text-gray-400 mb-6">in {communityName}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Name *
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              maxLength={50}
              placeholder="e.g., Calculus Study Session"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !roomName.trim()}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}