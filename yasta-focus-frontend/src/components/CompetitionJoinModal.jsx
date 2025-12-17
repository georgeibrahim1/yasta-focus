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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {competition?.comp_description?.split(' ').slice(0, 2).join(' ') || 'Competition'} Competition
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Chosen Subject {addedSubjects.length + 1}
            </h3>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Subject 1</option>
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
              <p className="mt-2 text-xs text-slate-400">You haven't created any subjects yet. Create one first to join competitions.</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddSubject}
            disabled={!selectedSubjectId}
            className="w-full px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
          >
            Add
          </button>

          {addMessage && (
            <div className="p-3 rounded-lg bg-green-700/20 border border-green-600/50 text-green-300 text-sm">
              {addMessage}
            </div>
          )}

          {addedSubjects.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-400">Added Subjects:</h4>
              <div className="space-y-2">
                {addedSubjects.map(subject => (
                  <div
                    key={getSubjectKey(subject)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600"
                  >
                    <span className="text-white text-sm font-medium">{subject.name || subject.subject_name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(getSubjectKey(subject))}
                      className="text-slate-400 hover:text-red-400 transition"
                    >
                      <X size={16} />
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
              className="flex-1 px-6 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || addedSubjects.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
