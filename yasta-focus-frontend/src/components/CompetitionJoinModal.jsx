import React, { useState } from 'react'

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
        subjects: subjectIds
      })
      setAddedSubjects([])
      setSelectedSubjectId('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Join Competition</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {addMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-600/20 border border-green-600/30 text-green-300 text-sm">
            {addMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-slate-300 text-sm font-medium">
                Select Subject
              </label>
              {competition?.max_subjects && (
                <span className="text-xs text-slate-400">
                  {addedSubjects.length}/{competition.max_subjects} max
                </span>
              )}
            </div>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
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
              <p className="mt-2 text-xs text-amber-400">You haven't created any subjects yet. Create one first to join competitions.</p>
            )}
            {competition?.max_subjects && addedSubjects.length >= competition.max_subjects && (
              <p className="mt-2 text-xs text-amber-400">Maximum subjects limit reached</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddSubject}
            disabled={!selectedSubjectId || (competition?.max_subjects && addedSubjects.length >= competition.max_subjects)}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            Add Subject
          </button>

          {addedSubjects.length > 0 && (
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Selected Subjects ({addedSubjects.length})
              </label>
              <div className="space-y-2">
                {addedSubjects.map((subject) => (
                  <div
                    key={getSubjectKey(subject)}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-700 border border-slate-600"
                  >
                    <span className="text-white text-sm">{subject.name || subject.subject_name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(getSubjectKey(subject))}
                      className="text-slate-400 hover:text-red-400 transition"
                    >
                      ✕
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
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || addedSubjects.length === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Joining...' : `Join${addedSubjects.length > 0 ? ` (${addedSubjects.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
