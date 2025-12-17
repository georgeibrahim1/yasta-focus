import React, { useState } from 'react'
import { X } from 'lucide-react'

export default function CompetitionJoinModal({ competition, isOpen = false, onClose = () => {}, onSubmit = () => {}, subjects = [] }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [addedSubjects, setAddedSubjects] = useState([])
  const [addMessage, setAddMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !competition) return null

  const getSubjectKey = (s) => s.id ?? s._id ?? s.subject_name

  const handleAddSubject = () => {
    if (selectedSubjectId) {
      const subject = subjects.find(s => String(getSubjectKey(s)) === String(selectedSubjectId))
      const already = addedSubjects.find(s => String(getSubjectKey(s)) === String(selectedSubjectId))
      
      if (subject && !already) {
        setAddedSubjects([...addedSubjects, subject])
        setAddMessage(`${subject.name || subject.subject_name} has been added`)
        setSelectedSubjectId('')
        setTimeout(() => setAddMessage(''), 2000)
      } else if (!subject) {
        setAddMessage('Selected subject not found')
        setTimeout(() => setAddMessage(''), 2000)
      }
    }
  }

  const handleRemoveSubject = (subjectId) => {
    setAddedSubjects(addedSubjects.filter(s => String(getSubjectKey(s)) !== String(subjectId)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const subjectIds = addedSubjects.map(s => getSubjectKey(s))
      await onSubmit({
        competitionId: competition.competition_id,
        subjects: subjectIds // Directly pass subjects
      })
      setAddedSubjects([])
      setSelectedSubjectId('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-lg w-full border border-slate-700 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Join Competition
            </h2>
            <p className="text-slate-400 text-sm">Select subjects to compete in</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white">
                Select Subject
              </h3>
              {competition?.max_subjects && (
                <span className="text-xs text-slate-400">
                  {addedSubjects.length}/{competition.max_subjects} max
                </span>
              )}
            </div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              disabled={competition?.max_subjects && addedSubjects.length >= competition.max_subjects}
            >
              <option value="">Choose a subject...</option>
              {subjects && subjects.length > 0 ? (
                subjects.map(s => (
                  <option key={getSubjectKey(s)} value={getSubjectKey(s)}>
                    {s.name || s.subject_name || s.title}
                  </option>
                ))
              ) : (
                <option disabled>No subjects available</option>
              )}
            </select>
            {subjects && subjects.length === 0 && (
              <p className="mt-2 text-xs text-amber-400">⚠️ You haven't created any subjects yet. Create one first to join competitions.</p>
            )}
            {competition?.max_subjects && addedSubjects.length >= competition.max_subjects && (
              <p className="mt-2 text-xs text-amber-400">⚠️ Maximum subjects limit reached</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddSubject}
            disabled={!selectedSubjectId || (competition?.max_subjects && addedSubjects.length >= competition.max_subjects)}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all hover:scale-[1.02] shadow-lg"
          >
            Add Subject
          </button>

          {addMessage && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 text-green-300 text-sm font-medium flex items-center gap-2">
              <span>✓</span>
              {addMessage}
            </div>
          )}

          {addedSubjects.length > 0 && (
            <div className="space-y-3 bg-slate-700/20 rounded-xl p-4 border border-slate-600/30">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Selected Subjects ({addedSubjects.length})
              </h4>
              <div className="space-y-2">
                {addedSubjects.map((subject, index) => (
                  <div
                    key={getSubjectKey(subject)}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-white text-sm font-semibold">{subject.name || subject.subject_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(getSubjectKey(subject))}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 rounded-xl text-white font-semibold hover:bg-slate-600 transition-all hover:scale-[1.02]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || addedSubjects.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl text-white font-semibold hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg shadow-teal-500/20"
            >
              {isLoading ? 'Joining...' : `Join Competition${addedSubjects.length > 0 ? ` (${addedSubjects.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
