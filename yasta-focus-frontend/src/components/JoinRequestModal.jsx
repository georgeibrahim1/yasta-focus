import React, { useState } from 'react'
import { X } from 'lucide-react'
import Input from './Input'
import { useJoinCommunity } from '../services/communityServices/hooks/useJoinCommunity'

export default function JoinRequestModal({ community, isOpen = false, onClose = () => {} }) {
  const [message, setMessage] = useState('')
  const joinMutation = useJoinCommunity()

  if (!isOpen || !community) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    joinMutation.mutate(
      { communityId: community.id, payload: { message } },
      {
        onSuccess: () => {
          setMessage('')
          onClose()
        }
      }
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            Request to join
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <p className="text-slate-300 text-sm mb-4">{community.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Message to admins (optional)"
            placeholder="Why do you want to join?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 rounded-xl text-white text-sm hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={joinMutation.isPending}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {joinMutation.isPending ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
