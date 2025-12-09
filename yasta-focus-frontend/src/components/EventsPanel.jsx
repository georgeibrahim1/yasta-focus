import React from 'react'
import { useGetEvents } from '../services/communityServices/hooks/useGetEvents'
import { useGetCompetitions } from '../services/communityServices/hooks/useGetCompetitions'

export default function EventsPanel({ onAddEvent = () => {}, onViewEvent = () => {}, onJoinCompetition = () => {}, onViewCompetition = () => {}, isAdmin = false }) {
  const { data: events = [], isLoading: eventsLoading } = useGetEvents()
  const { data: competitions = [], isLoading: compsLoading } = useGetCompetitions()

  // debug: log competitions each render to observe joined state
  // remove or guard in production
  try {
    // eslint-disable-next-line no-console
    console.log('[EventsPanel] competitions', competitions.map(c => ({ id: c.id, joined: c.joined })))
  } catch (e) {}

  return (
    <aside className="space-y-6 sticky top-6">
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
            <div key={ev.id} className="flex items-center justify-between gap-3 mb-4 last:mb-0">
              <div className="flex-1 min-w-0 pr-6">
                <div className="text-slate-200 font-medium text-sm">{ev.title}</div>
                <div className="text-slate-400 text-xs">{ev.dateLabel || ev.date}</div>
              </div>
              <button
                onClick={() => onViewEvent(ev)}
                className="w-20 text-center px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600 transition whitespace-nowrap"
              >
                View
              </button>
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
            {competitions.map((comp) => (
              <div key={comp.id} className="flex items-center justify-between mb-3">
                <div className="min-w-0 pr-6">
                  <div className="text-slate-200 text-sm">{comp.title}</div>
                  <div className="text-slate-400 text-xs">Ends {comp.endDate}</div>
                </div>
                <button
                  onClick={() => {
                    if (comp.joined) {
                      // user already joined — currently we do nothing (reserved for view behavior)
                      onViewCompetition(comp)
                    } else {
                      onJoinCompetition(comp)
                    }
                  }}
                  className="w-20 text-center px-3 py-1.5 text-xs rounded-md transition whitespace-nowrap"
                  disabled={comp.joined === 'pending'}
                  style={{
                    backgroundColor: comp.joined ? (comp.joined === 'pending' ? '#64748b' : '#4f46e5') : '#6366f1',
                    color: 'white'
                  }}
                >
                  {comp.joined === 'pending' ? 'Pending' : (comp.joined ? 'View' : 'Join')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-xs">No competitions</div>
        )}
      </div>
    </aside>
  )
}
