import React from 'react'
import { Users, Tag } from 'lucide-react'

export default function CommunityCard({ community = {}, onJoin = () => {}, onView = () => {}, isAdmin = false }) {
  const { 
    community_id, 
    community_name, 
    community_description, 
    member_count: membersCount = 0,
    tags = [],
    user_status
  } = community

  const isJoined = user_status === 'Accepted'
  const isPending = user_status === 'Pending'
  // Only show moderator status if user is actually a moderator (not just because backend marked admins)
  // The isAdmin prop handles admin display separately
  const isModerator = !isAdmin && (community.ismanager || community.is_moderator)

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm hover:border-slate-600 transition flex flex-col h-full">
      {/* Header with gradient */}
      <div className="h-28 bg-gradient-to-r from-indigo-600 to-teal-500 flex items-end p-4">
        <div className="text-white font-semibold text-lg">{community_name}</div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Description */}
        <p className="text-slate-300 text-sm line-clamp-2">{community_description}</p>

        {/* Tags Display */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-1 text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md border border-slate-600/50"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-slate-400 self-center">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
      
        {/* Spacer pushes the members+status and button to the bottom */}
        <div className="flex-1" />

        <div className="flex flex-col gap-3">
          {/* Members count */}
          <div className="flex items-center text-slate-400 text-sm">
            <Users size={16} className="mr-2" />
            <span>{membersCount.toLocaleString()} {membersCount === 1 ? 'Member' : 'Members'}</span>
          </div>

          {/* Action button */}
          <div>
            {isAdmin ? (
              <button
                onClick={onView}
                className="w-full px-4 py-2 rounded-xl bg-yellow-600 text-white transition text-sm font-medium cursor-pointer hover:bg-yellow-500"
              >
                Manage
              </button>
            ) : isModerator ? (
              <button
                onClick={onView}
                className="w-full px-4 py-2 rounded-xl bg-purple-600 text-white transition text-sm font-medium cursor-pointer hover:bg-purple-500"
              >
                Moderate
              </button>
            ) : isJoined ? (
              <button
                onClick={onView}
                className="w-full px-4 py-2 rounded-xl bg-slate-600 text-white transition text-sm font-medium cursor-pointer hover:bg-slate-500"
              >
                View
              </button>
            ) : isPending ? (
              <button
                disabled
                className="w-full px-4 py-2 rounded-xl bg-slate-600 text-white transition text-sm font-medium cursor-not-allowed opacity-70"
              >
                Pending
              </button>
            ) : (
              <button
                onClick={onJoin}
                className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-sm font-medium"
              >
                Join
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}