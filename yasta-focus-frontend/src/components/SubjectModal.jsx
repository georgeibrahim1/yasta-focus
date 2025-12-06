import { X } from 'lucide-react'
import Input from './Input'

export default function SubjectModal({ isOpen, onClose, onSubmit, formData, setFormData, isLoading }) {
  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Subject</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g., Calculus III"
            value={formData.subject_name}
            onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
            required
          />
          <div className="w-full">
            <label className="block mb-1.5 text-sm text-slate-400">
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief description of this subject..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px]"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
