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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{competition.competition_name || 'Competition Details'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-400 mb-2 block">Type</label>
            <p className="text-white capitalize">{competition.competition_type}</p>
          </div>

          {competition.max_subjects && (
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Max Subjects</label>
              <p className="text-white">{competition.max_subjects}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-sm font-medium text-slate-400 mb-2 block">Duration</label>
            <p className="text-white">{new Date(competition.start_time).toLocaleDateString()} → {new Date(competition.end_time).toLocaleDateString()}</p>
          </div>

          {/* Show selected subjects for joined members */}
          {!isManager && competition.entry_status === 'joined' && userSubjects.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Your Selected Subjects</label>
              <div className="flex flex-wrap gap-2">
                {userSubjects.map((subject, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300 text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Show participants for managers */}
          {isManager && (
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Current Participants ({participants.length})</label>
              {loading ? (
                <p className="text-slate-400 text-sm">Loading participants...</p>
              ) : participants.length === 0 ? (
                <p className="text-slate-400 text-sm">No participants yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {participants.map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {participant.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{participant.username}</p>
                        <p className="text-xs text-slate-400">
                          {participant.subject_count} subject{participant.subject_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {competition.comp_description && (
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Description</label>
              <p className="text-slate-300 whitespace-pre-wrap">{competition.comp_description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
