import React, { useState } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'
import { useQueryClient } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function CreateGlobalCompetitionModal({ isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    competition_name: '',
    comp_description: '',
    end_time: '',
    max_subjects: '',
    max_participants: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...formData,
        max_subjects: formData.max_subjects ? parseInt(formData.max_subjects) : null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
      }

      await axios.post(
        `${API_URL}/api/competitions/create-global`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Invalidate competitions query to refetch
      queryClient.invalidateQueries({ queryKey: ['competitions', 'all'] })
      
      // Reset form and close
      setFormData({
        competition_name: '',
        comp_description: '',
        end_time: '',
        max_subjects: '',
        max_participants: ''
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create competition')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Create Global Competition
            </h2>
            <p className="text-slate-400 text-sm">Open to all students on the platform</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Competition Name *
            </label>
            <input
              type="text"
              name="competition_name"
              value={formData.competition_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="e.g., Winter Study Marathon 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              name="comp_description"
              value={formData.comp_description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              placeholder="Describe the competition goals and rules..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <p className="text-xs text-slate-400 mt-1">Competition starts immediately when created</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Max Subjects per Student
              </label>
              <input
                type="number"
                name="max_subjects"
                value={formData.max_subjects}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="e.g., 3"
              />
              <p className="text-xs text-slate-400 mt-1">Leave empty for unlimited</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="e.g., 100"
              />
              <p className="text-xs text-slate-400 mt-1">Leave empty for unlimited</p>
            </div>
          </div>

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
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-lg shadow-purple-500/20"
            >
              {isLoading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
