import React, { useState } from 'react'
import { X } from 'lucide-react'

export default function CreateCommunityModal({ isOpen = false, onClose = () => {}, onSubmit = () => {} }) {
  const [formData, setFormData] = useState({
    community_Name: '',
    community_Description: '',
    tags: []
  })
  const [currentTag, setCurrentTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleAddTag = () => {
    if (currentTag.trim() === '') return
    if (formData.tags.includes(currentTag.trim())) {
      setError('Tag already added')
      return
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, currentTag.trim()]
    }))
    setCurrentTag('')
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.community_Name.trim()) {
      setError('Community name is required')
      return
    }

    if (!formData.community_Description.trim()) {
      setError('Description is required')
      return
    }

    setIsLoading(true)
    try {
      console.log('[CreateCommunityModal] Submitting:', {
        community_Name: formData.community_Name.trim(),
        community_Description: formData.community_Description.trim(),
        tags: formData.tags
      })
      await onSubmit({
        community_Name: formData.community_Name.trim(),
        community_Description: formData.community_Description.trim(),
        tags: formData.tags
      })
      setFormData({ community_Name: '', community_Description: '', tags: [] })
      setCurrentTag('')
      onClose()
    } catch (err) {
      console.error('[CreateCommunityModal] Error caught:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create community'
      console.error('[CreateCommunityModal] Error message:', errorMsg)
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl p-8 max-w-lg w-full border border-slate-700 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Community</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-700/20 border border-red-600/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">Community Name</label>
            <input
              type="text"
              name="community_Name"
              value={formData.community_Name}
              onChange={handleInputChange}
              placeholder="Enter community name"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              maxLength={50}
            />
            <p className="text-xs text-slate-400 mt-1">{formData.community_Name.length}/50</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              name="community_Description"
              value={formData.community_Description}
              onChange={handleInputChange}
              placeholder="Describe your community..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/50 text-indigo-300 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-300 hover:text-indigo-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-400 rounded-xl text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
