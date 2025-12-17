import React from 'react'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import { useGetEvents } from '../services/communityServices'

export default function EventsPanel({ 
  onAddEvent = () => {}, 
  onInfoEvent = () => {},
  onJoinEvent = () => {},
  onDeleteEvent = () => {},
  onJoinCompetition = () => {}, 
  onViewCompetition = () => {},
  onInfoCompetition = () => {},
  isAdmin = false 
}) {
  const { data: eventsData, isLoading: eventsLoading } = useGetEvents()
  const events = eventsData || []

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Events</h3>
        </div>
        {isAdmin && (
          <button
            onClick={onAddEvent}
            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {eventsLoading ? (
        <div className="text-slate-400 text-xs">Loading...</div>
      ) : events.length > 0 ? (
        events.slice(0, 4).map((ev) => (
          <div key={ev.id} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 font-medium text-sm">{ev.title}</div>
                <div className="text-slate-400 text-xs">
                  {new Date(ev.date).toLocaleDateString()}
                  {ev.is_live && <span className="ml-2 text-green-400">● Live</span>}
                </div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => onDeleteEvent(ev)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                  title="Delete event"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onInfoEvent(ev)}
                className="flex-1 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600 transition"
              >
                Info
              </button>
              {ev.is_live && (
                <button
                  onClick={() => onJoinEvent(ev)}
                  className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-500 transition"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-slate-400 text-xs">No events yet</div>
      )}
    </div>
  )
}
