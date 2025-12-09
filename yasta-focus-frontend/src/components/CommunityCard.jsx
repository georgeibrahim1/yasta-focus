import React from 'react'
import { Users, CircleDot } from 'lucide-react'

export default function CommunityCard({ community = {}, onJoin = () => {}, onView = () => {} }) {
  const { id, name, description, membersCount = 0, joined = false, hasActiveRoom = false, coverImageUrl } = community

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm hover:border-slate-600 transition flex flex-col h-full">
      <div className="h-28 bg-gradient-to-r from-indigo-600 to-teal-500 flex items-end p-4">
        <div className="text-white font-semibold text-lg">{name}</div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-slate-300 text-sm line-clamp-2">{description}</p>

        {/* spacer pushes the members+status and button to the bottom */}
        <div className="flex-1" />

        <div className="flex flex-col gap-3">
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
