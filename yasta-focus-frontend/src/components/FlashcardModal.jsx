import { X } from 'lucide-react'

export default function FlashcardModal({ isOpen, onClose, onSubmit, formData, setFormData, isLoading, isEditing, error }) {
  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Flashcard' : 'Add New Flashcard'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}
          {/* Question */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-medium text-slate-300">
              Question *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question..."
              required
              disabled={isEditing}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            {isEditing && (
              <p className="text-xs text-slate-500 mt-1">
                Question cannot be edited
              </p>
            )}
          </div>

          {/* Answer */}
          <div className="w-full">
            <label className="block mb-2 text-sm font-medium text-slate-300">
              Answer *
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter the answer..."
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Flashcard' : 'Add Flashcard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
