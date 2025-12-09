import React from 'react'
import { Plus } from 'lucide-react'

export default function CreateCommunityButton({ onClick = () => {} }) {
  return (
    <div className="fixed right-8 bottom-8 z-40">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-teal-400 text-white shadow-lg hover:opacity-90 transition font-medium"
      >
        <Plus size={18} />
        <span>Create New Community</span>
      </button>
    </div>
  )
}
