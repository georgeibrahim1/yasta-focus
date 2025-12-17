import { X } from 'lucide-react'
import Input from './Input'

export default function TaskModal({ isOpen, onClose, onSubmit, formData, setFormData, isLoading, isEditing = false, error }) {
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
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g., Complete Problem Set 7"
            value={formData.task_title}
            onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
            required
          />
          <div className="w-full">
            <label className="block mb-1.5 text-sm text-slate-400">
              Description (Optional)
            </label>
            <textarea
              placeholder="Additional task details..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px]"
            />
          </div>
          <div className="w-full">
            <label className="block mb-1.5 text-sm text-slate-400">
              Deadline (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.deadline ? new Date(formData.deadline).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="w-full">
            <label className="block mb-1.5 text-sm text-slate-400">
              Status
            </label>
            <select
              value={formData.status || 'Not Started'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-600 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
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
              {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
