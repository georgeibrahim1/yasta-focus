import React from 'react'
import { useGetEvents } from '../services/communityServices/hooks/useGetEvents'
import { useGetCompetitions } from '../services/communityServices/hooks/useGetCompetitions'

export default function EventsPanel({ 
  onAddEvent = () => {}, 
  onViewEvent = () => {}, 
  onJoinEvent = () => {},
  onInfoEvent = () => {},
  onJoinCompetition = () => {}, 
  onViewCompetition = () => {},
  onInfoCompetition = () => {},
  isAdmin = false 
}) {
  const { data: events = [], isLoading: eventsLoading } = useGetEvents()
  const { data: competitions = [], isLoading: compsLoading } = useGetCompetitions()

  return (
    <aside className="space-y-6">
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

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h4 className="text-white font-semibold text-sm mb-3">Ongoing Global Competitions</h4>
        {compsLoading ? (
          <div className="text-slate-400 text-xs">Loading...</div>
        ) : competitions.length > 0 ? (
          <div className="space-y-3">
            {competitions.map((comp) => {
              const isJoined = comp.entry_status === 'joined'
              return (
                <div key={comp.competition_id} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-200 text-sm">
                        {comp.comp_description?.split(' ').slice(0, 3).join(' ') || 'Competition'}
                      </div>
                      <div className="text-slate-400 text-xs">
                        Ends {new Date(comp.end_time).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onInfoCompetition(comp)}
                      className="flex-1 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600 transition"
                    >
                      Info
                    </button>
                    <button
                      onClick={() => {
                        if (isJoined) {
                          onViewCompetition(comp)
                        } else {
                          onJoinCompetition(comp)
                        }
                      }}
                      className={`flex-1 px-3 py-1.5 text-white rounded-lg text-xs transition ${
                        isJoined 
                          ? 'bg-slate-600 hover:bg-slate-500' 
                          : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {isJoined ? 'View' : 'Join'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-slate-400 text-xs">No competitions</div>
        )}
      </div>
    </aside>
  )
}
