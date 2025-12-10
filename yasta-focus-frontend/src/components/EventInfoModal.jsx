import React from 'react'
import { X } from 'lucide-react'

export default function EventInfoModal({ event, isOpen, onClose }) {
  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{event.title}</h2>
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
            <label className="text-sm font-medium text-slate-400 mb-2 block">Event Date</label>
            <p className="text-white">{new Date(event.date).toLocaleString()}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Description</label>
            <p className="text-slate-300 whitespace-pre-wrap">{event.description}</p>
          </div>
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
