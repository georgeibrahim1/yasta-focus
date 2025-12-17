import React, { useState } from 'react'
import { Trophy } from 'lucide-react'
import ReportModal from '../components/ReportModal'
import LeaderboardRow from '../components/LeaderboardRow'
import { useGetLeaderboard, useGiveXP, useSendFriendRequest, useReportUser } from '../services/leaderboardServices'
import { useUser } from '../services/authServices'

export default function LeaderboardPage() {
  const [filter, setFilter] = useState('all') // all, daily, weekly, monthly
  
  const { data: leaderboard = [], isLoading } = useGetLeaderboard(filter)
  const { data: currentUser } = useUser()
  const { mutate: giveXP } = useGiveXP()
  const { mutate: sendFriendRequest } = useSendFriendRequest()
  const { mutate: reportUser } = useReportUser()

  const [selectedUser, setSelectedUser] = useState(null)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleGiveXP = (user, rank) => {
    giveXP({ userId: user.user_id, rank })
  }

  const handleFriendRequest = (user) => {
    sendFriendRequest(user.user_id)
  }

  const handleReport = (user) => {
    setSelectedUser(user)
    setShowReportModal(true)
  }

  const handleReportSubmit = async ({ userId, title, description }) => {
    reportUser({ userId, title, description })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Trophy className="text-orange-400" size={40} />
          Leaderboard
        </h1>
        <p className="text-slate-400">
          Compete with others and track your ranking.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setFilter('monthly')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            filter === 'monthly'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => setFilter('weekly')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            filter === 'weekly'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setFilter('daily')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            filter === 'daily'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Today
        </button>
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="text-slate-400 text-center py-12">Loading leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-slate-400 text-center py-12">No users found</div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-indigo-400" />
              {filter === 'all' && 'All Time Rankings'}
              {filter === 'monthly' && 'This Month Rankings'}
              {filter === 'weekly' && 'This Week Rankings'}
              {filter === 'daily' && 'Today Rankings'}
            </h2>

            <div className="space-y-2">
              {leaderboard.map((user, index) => (
                <LeaderboardRow
                  key={user.user_id}
                  user={user}
                  rank={index + 1}
                  currentUserId={currentUser?.data?.user?.user_id}
                  onFriendRequest={handleFriendRequest}
                  onReport={handleReport}
                  onGiveXP={handleGiveXP}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        user={selectedUser}
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setSelectedUser(null)
        }}
        onSubmit={handleReportSubmit}
      />
    </div>
  )
}
