import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Trophy, Globe } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import LeaderboardRow from '../components/LeaderboardRow'
import ReportModal from '../components/ReportModal'
import { useUser } from '../services/authServices'
import { useSendFriendRequest, useReportUser, useGiveXP } from '../services/leaderboardServices'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function GlobalCompetitionLeaderboardPage() {
  const { competitionId } = useParams()
  const navigate = useNavigate()
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const { data: userData } = useUser()
  const currentUserId = userData?.data?.user?.user_id || userData?.user?.user_id || userData?.user_id

  const { mutate: sendFriendRequest } = useSendFriendRequest()
  const { mutate: reportUser } = useReportUser()
  const { mutate: giveXP } = useGiveXP()

  // Fetch leaderboard data
  const { data: leaderboardData = [], isLoading, isError } = useQuery({
    queryKey: ['globalCompetitionLeaderboard', competitionId],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/api/competitions/${competitionId}/leaderboard`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data.data
    }
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Back Arrow */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          <Globe className="w-10 h-10 text-purple-400" />
          Global Competition Leaderboard
        </h1>
        <p className="text-slate-400">
          View global competition rankings
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-slate-400 text-center py-12">Loading leaderboard...</div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-red-400 text-center py-12">Error loading leaderboard data</div>
      )}

      {/* No Data State */}
      {!isLoading && !isError && leaderboardData.length === 0 && (
        <div className="text-slate-400 text-center py-12">No participants yet</div>
      )}

      {/* Leaderboard Content */}
      {!isLoading && !isError && leaderboardData.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-400" />
              Global Competition Rankings
            </h2>
            <div className="space-y-2">
              {leaderboardData.map((entry, index) => {
                // Transform competition entry to match LeaderboardRow format
                const userForRow = {
                  user_id: entry.user_id,
                  username: entry.username,
                  profile_picture: entry.profile_picture,
                  total_study_time: entry.total_time,
                  xp: entry.xp || 0,
                  interests: entry.subjects || [], // Show subjects as interests
                  most_studied_subject: null,
                  friendship_status: entry.friendship_status || 'none'
                }
                
                return (
                  <LeaderboardRow
                    key={entry.user_id}
                    user={userForRow}
                    rank={index + 1}
                    currentUserId={currentUserId}
                    onFriendRequest={(user) => sendFriendRequest(user.user_id)}
                    onReport={(user) => {
                      setSelectedUser(user)
                      setShowReportModal(true)
                    }}
                    onGiveXP={(user, rank) => giveXP({ userId: user.user_id, rank })}
                  />
                )
              })}
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
        onSubmit={({ userId, title, description }) => {
          reportUser({ userId, title, description })
          setShowReportModal(false)
          setSelectedUser(null)
        }}
      />
    </div>
  )
}
