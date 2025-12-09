import React from 'react'
import { Users, CircleDot, Tag } from 'lucide-react'
import { useGetTags } from '../services/communityServices/hooks/useGetCommunityTag'

export default function CommunityCard({ community = {}, onJoin = () => {}, onView = () => {} }) {
  const { 
    community_id, 
    community_name, 
    community_description, 
    members_count: membersCount = 0,
    joined = false, 
    has_active_room: hasActiveRoom = false, 
    coverImageUrl 
  } = community

  // Fetch tags separately for this community
  const { data: tagsData, isLoading: tagsLoading } = useGetTags(community_id)
  const tags = tagsData || []

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
        {tagsLoading ? (
          // <div className="text-xs text-slate-500">Loading tags...</div>
          <div></div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tagObj, index) => (
              <span 
                key={index} 
                className="inline-flex items-center gap-1 text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md border border-slate-600/50"
              >
                <Tag size={10} />
                {tagObj.tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-slate-400 self-center">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        ) : null}
      
        {/* Spacer pushes the members+status and button to the bottom */}
        <div className="flex-1" />

        <div className="flex flex-col gap-3">
          {/* Members count and active status */}
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <div className="flex items-center gap-3">
              <Users size={16} />
              <span>{membersCount.toLocaleString()} Members</span>
            </div>
            {hasActiveRoom && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-700/20 text-green-300 px-2 py-1 rounded-full">
                <CircleDot size={12} />
                Active
              </span>
            )}
          </div>

          {/* Action button */}
          <div>
            {joined ? (
              <button
                onClick={onView}
                className="w-full px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition text-sm font-medium"
              >
                View
              </button>
            ) : (
              <button
                onClick={onJoin}
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 transition text-sm font-medium"
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