import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function CompetitionInfoModal({ competition, isOpen, onClose, communityId, isManager, isGlobal = false }) {
  const [participants, setParticipants] = useState([])
  const [userSubjects, setUserSubjects] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && competition) {
      fetchCompetitionData()
    }
  }, [isOpen, competition])

  const fetchCompetitionData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (isManager) {
        // Fetch participants for manager (always show, regardless of join status)
        const endpoint = isGlobal 
          ? `${API_URL}/api/competitions/${competition.competition_id}/participants`
          : `${API_URL}/api/communities/${communityId}/competitions/${competition.competition_id}/participants`
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setParticipants(response.data.data || [])
      } else if (competition.entry_status === 'joined') {
        // Fetch user's selected subjects only if joined
        const endpoint = isGlobal
          ? `${API_URL}/api/competitions/${competition.competition_id}/my-subjects`
          : `${API_URL}/api/communities/${communityId}/competitions/${competition.competition_id}/my-subjects`
        
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUserSubjects(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching competition data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !competition) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{competition.competition_name || 'Competition Details'}</h2>
            <p className="text-sm text-slate-400">Competition Information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <label className="text-xs font-medium text-slate-400 mb-1 block uppercase tracking-wide">Type</label>
              <p className="text-white font-semibold capitalize">{competition.competition_type}</p>
            </div>
            
            {competition.max_subjects && (
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                <label className="text-xs font-medium text-slate-400 mb-1 block uppercase tracking-wide">Max Subjects</label>
                <p className="text-white font-semibold">{competition.max_subjects}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <label className="text-xs font-medium text-slate-400 mb-2 block uppercase tracking-wide">Duration</label>
            <div className="flex items-center gap-3 text-white">
              <span className="font-semibold">📅 {new Date(competition.start_time).toLocaleDateString()}</span>
              <span className="text-slate-400">→</span>
              <span className="font-semibold">📅 {new Date(competition.end_time).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Show selected subjects for joined members */}
          {!isManager && competition.entry_status === 'joined' && userSubjects.length > 0 && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <label className="text-xs font-medium text-slate-400 mb-3 block uppercase tracking-wide">Your Selected Subjects</label>
              <div className="flex flex-wrap gap-2">
                {userSubjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 rounded-lg text-indigo-300 text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Show participants for managers */}
          {isManager && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <label className="text-xs font-medium text-slate-400 mb-3 block uppercase tracking-wide flex items-center justify-between">
                <span>Current Participants</span>
                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {participants.length}
                </span>
              </label>
              {loading ? (
                <p className="text-slate-400 text-sm text-center py-4">Loading participants...</p>
              ) : participants.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No participants yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3 p-3 bg-slate-600/30 hover:bg-slate-600/50 rounded-lg transition-all border border-slate-500/20"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {participant.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{participant.username}</p>
                        <p className="text-xs text-indigo-400 font-medium">
                          📚 {participant.subject_count} subject{participant.subject_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {competition.comp_description && (
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <label className="text-xs font-medium text-slate-400 mb-2 block uppercase tracking-wide">Description</label>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{competition.comp_description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 flex justify-end bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-semibold hover:scale-105 shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
