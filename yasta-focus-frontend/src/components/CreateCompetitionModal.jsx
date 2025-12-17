import React, { useState } from 'react'

export default function CreateCompetitionModal({ isOpen, onClose, onSubmit, communityId }) {
  const [formData, setFormData] = useState({
    competition_name: '',
    end_time: '',
    max_subjects: '',
    max_participants: '',
    comp_description: '',
    community_id: communityId,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.competition_name.trim()) {
      setError('Competition name is required')
      return
    }
    if (!formData.end_time) {
      setError('End time is required')
      return
    }
    const currentTimestamp = new Date()
    if (currentTimestamp >= new Date(formData.end_time)) {
      setError('End time must be after the current time')
      return
    }

    setIsLoading(true)
    try {
      const submissionData = {
        ...formData,
        competition_type: 'local',
      }
      await onSubmit(submissionData)
      setFormData({
        competition_name: '',
        end_time: '',
        max_subjects: '',
        max_participants: '',
        comp_description: '',
        community_id: communityId,
      })
      onClose()
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create competition'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Competition</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-600/20 border border-red-600/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Competition Name
            </label>
            <input
              type="text"
              name="competition_name"
              value={formData.competition_name}
              onChange={handleChange}
              required
              maxLength={50}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              placeholder="Enter competition name"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="comp_description"
              value={formData.comp_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Describe the competition..."
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Max Subjects
              </label>
              <input
                type="number"
                name="max_subjects"
                value={formData.max_subjects}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 5"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Max Participants
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                min="1"
                placeholder="e.g., 50"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

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
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}