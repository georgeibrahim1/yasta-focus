import React from 'react'
import { X } from 'lucide-react'

export default function CompetitionInfoModal({ competition, isOpen, onClose }) {
  if (!isOpen || !competition) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">{competition.title || 'Competition Details'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)] space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Type</label>
            <p className="text-white capitalize">{competition.competition_type}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Duration</label>
            <p className="text-white">
              {new Date(competition.start_time).toLocaleDateString()} - {new Date(competition.end_time).toLocaleDateString()}
            </p>
          </div>

          {competition.max_subjects && (
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Max Subjects</label>
              <p className="text-white">{competition.max_subjects}</p>
            </div>
          )}

          {competition.max_participants && (
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Max Participants</label>
              <p className="text-white">{competition.max_participants}</p>
            </div>
          )}

          {competition.comp_description && (
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Description</label>
              <p className="text-slate-300 whitespace-pre-wrap">{competition.comp_description}</p>
            </div>
          )}
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
