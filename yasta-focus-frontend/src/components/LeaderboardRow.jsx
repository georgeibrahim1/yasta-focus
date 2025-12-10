import React, { useState } from 'react'
import { Trophy, Medal, Award, UserPlus, Flag, Gift } from 'lucide-react'

export default function LeaderboardRow({ 
  user, 
  rank, 
  currentUserId,
  onFriendRequest, 
  onReport, 
  onGiveXP 
}) {
  const [hasGivenXP, setHasGivenXP] = useState(false)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />
    return <span className="text-slate-400 font-semibold">{rank}</span>
  }

  const getXPAmount = (rank) => {
    if (rank === 1) return 20
    if (rank === 2) return 10
    if (rank === 3) return 5
    return 1
  }

  const interests = user.interests || []
  const displayInterests = interests.slice(0, 2)
  const hasMoreInterests = interests.length > 2
  const isCurrentUser = user.user_id === currentUserId

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
        rank <= 3
          ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30'
          : 'bg-slate-700/30 hover:bg-slate-700/50'
      }`}
    >
      {/* Rank */}
      <div className="w-12 flex justify-center">
        {getRankIcon(rank)}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        {user.profile_picture ? (
          <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
        ) : (
          user.username?.charAt(0).toUpperCase()
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white">{user.username}</span>
          {user.friendship_status === 'friends' && (
            <span className="text-xs px-2 py-0.5 bg-green-600/20 text-green-400 rounded-full">
              Friend
            </span>
          )}
          {isCurrentUser && (
            <span className="text-xs px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded-full">
              You
            </span>
          )}
        </div>
        <div className="text-sm text-slate-400 flex items-center gap-3">
          <span>{formatTime(user.total_study_time)}</span>
          {user.most_studied_subject && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400">{user.most_studied_subject}</span>
            </>
          )}
        </div>
        {/* Interests */}
        {displayInterests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {displayInterests.map((interest, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-slate-600/50 text-slate-300 rounded-md"
              >
                {interest}
              </span>
            ))}
            {hasMoreInterests && (
              <span className="text-xs px-2 py-1 bg-slate-600/50 text-slate-400 rounded-md">
                +{interests.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* XP Display */}
      <div className="text-right mr-4">
        <div className="text-lg font-bold text-indigo-400">{user.xp} XP</div>
      </div>

      {/* Actions - Only show if not current user */}
      {!isCurrentUser && (
        <div className="flex items-center gap-2">
          {/* Friend Request */}
          {user.friendship_status === 'none' && (
            <button
              onClick={() => onFriendRequest(user)}
              className="p-2 hover:bg-slate-600 rounded-lg transition-colors group"
              title="Send friend request"
            >
              <UserPlus className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
            </button>
          )}
          {user.friendship_status === 'pending_sent' && (
            <button
              disabled
              className="p-2 rounded-lg cursor-not-allowed opacity-50"
              title="Request pending"
            >
              <UserPlus className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* Report */}
          <button
            onClick={() => onReport(user)}
            className="p-2 hover:bg-slate-600 rounded-lg transition-colors group"
            title="Report user"
          >
            <Flag className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
          </button>

          {/* Give XP */}
          <button
            onClick={() => {
              onGiveXP(user, rank)
              setHasGivenXP(true)
            }}
            disabled={hasGivenXP}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              hasGivenXP
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
            title={hasGivenXP ? 'Already gave XP' : `Give ${getXPAmount(rank)} XP`}
          >
            <Gift className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">
              {hasGivenXP ? '✓' : `+${getXPAmount(rank)}`}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
