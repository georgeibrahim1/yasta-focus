import React from 'react'
import { useGetEvents } from '../services/communityServices/hooks/useGetEvents'

export default function EventsPanel({ 
  onAddEvent = () => {}, 
  onInfoEvent = () => {},
  onJoinEvent = () => {},
  isAdmin = false 
}) {
  const { data: eventsData, isLoading: eventsLoading } = useGetEvents()
  const events = eventsData?.events || []

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Upcoming / Current Events</h3>
        {isAdmin && (
          <button
            onClick={onAddEvent}
            className="text-indigo-400 hover:text-indigo-300 text-xs"
          >
            + Add
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
