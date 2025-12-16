import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetUserProfile } from '../services/userServices'
import {
  useGetFriends,
  useGetFriendRequests,
  useRespondToFriendRequest,
  useRemoveFriend,
  useGiveXPToFriend
} from '../services/friendshipServices'
import { leaderboardService } from '../services/leaderboardServices/service'
import { useCheckInStatus } from '../services/leaderboardServices'
import { useUser } from '../services/authServices'
import { useGetAllAchievements } from '../services/achievementServices'
import ProtectedComponent from '../components/ProtectedComponent'
import AchievementCard from '../components/AchievementCard'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Users, 
  UserPlus, 
  UserMinus, 
  Gift,
  Check,
  X,
  Edit,
  Trophy,
  Star
} from 'lucide-react'

// Component for Gift XP button with per-friend check-in status
function GiftXPButton({ friendId, onGiveXP }) {
  const { data: checkInStatus } = useCheckInStatus(friendId)
  const hasGivenXP = checkInStatus?.hasCheckedIn || false

  return (
    <button
      onClick={() => onGiveXP(friendId)}
      disabled={hasGivenXP}
      className={`p-2 rounded-lg transition-colors ${
        hasGivenXP
          ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
          : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400'
      }`}
      title={hasGivenXP ? 'Already gave XP today' : 'Give 10 XP'}
    >
      <Gift className="w-5 h-5" />
    </button>
  )
}

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('about')
  
  const { data: currentUser } = useUser()
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(userId)
  const { data: achievements = [], isLoading: achievementsLoading } = useGetAllAchievements()
  const { data: friends = [], isLoading: friendsLoading } = useGetFriends()
  const { data: friendRequests = [], isLoading: requestsLoading } = useGetFriendRequests()
  
  const respondToRequest = useRespondToFriendRequest()
  const removeFriendMutation = useRemoveFriend()
  const giveXPMutation = useGiveXPToFriend()

  const isOwnProfile = !userId || userId === currentUser?.user?.user_id
  
  // Filter unlocked achievements
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const achievementCount = unlockedAchievements.length

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">User not found</p>
      </div>
    )
  }

  const handleSendFriendRequest = async () => {
    try {
      await leaderboardService.sendFriendRequest(userId)
      window.location.reload()
    } catch {
      alert('Error sending friend request')
    }
  }

  const handleRespondToRequest = async (requesterId, action) => {
    try {
      await respondToRequest.mutateAsync({ requesterId, action })
    } catch {
      alert('Error responding to request')
    }
  }

  const handleRemoveFriend = async (friendId) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      try {
        await removeFriendMutation.mutateAsync(friendId)
      } catch {
        alert('Error removing friend')
      }
    }
  }

  const handleGiveXP = async (friendId) => {
    try {
      await giveXPMutation.mutateAsync(friendId)
    } catch {
      alert('Error giving XP')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFriendshipButton = () => {
    if (isOwnProfile) return null

    switch (profile.friendship_status) {
      case 'friends':
        return (
          <button
            onClick={() => handleRemoveFriend(userId)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            Remove Friend
          </button>
        )
      case 'sent':
        return (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            Request Sent
          </button>
        )
      case 'received':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleRespondToRequest(userId, 'accept')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => handleRespondToRequest(userId, 'reject')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        )
      default:
        return (
          <button
            onClick={handleSendFriendRequest}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="relative">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-purple-600/20 border-4 border-purple-500 flex items-center justify-center">
                    <User className="w-12 h-12 text-purple-400" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">{profile.xp}</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profile.created_at)}
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-gray-300 max-w-2xl">{profile.bio}</p>
                )}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              {getFriendshipButton()}
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'about'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
            }`}
          >
            About
          </button>
          <ProtectedComponent requiredRole={1}>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'achievements'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
                {achievementCount > 0 && (
                  <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs">
                    {achievementCount}
                  </span>
                )}
              </div>
            </button>
          </ProtectedComponent>
          {isOwnProfile && (
            <>
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'friends'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Friends
                  {friends.length > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs">
                      {friends.length}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'requests'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Requests
                  {friendRequests.length > 0 && (
                    <span className="px-2 py-0.5 bg-red-500/50 rounded-full text-xs">
                      {friendRequests.length}
                    </span>
                  )}
                </div>
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          {activeTab === 'about' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">Total XP:</span>
                  <span>{profile.xp}</span>
                </div>
                <ProtectedComponent requiredRole={1}>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Award className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold">Achievements:</span>
                    <span>{achievementCount}</span>
                  </div>
                </ProtectedComponent>
                {profile.bio && (
                  <div>
                    <p className="font-semibold text-gray-300 mb-2">Bio:</p>
                    <p className="text-gray-400">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <ProtectedComponent requiredRole={1}>
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
                {achievementsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : unlockedAchievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlockedAchievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No achievements unlocked yet</p>
                )}
              </div>
            </ProtectedComponent>
          )}

          {activeTab === 'friends' && isOwnProfile && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Friends</h2>
              {friendsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div
                      key={friend.user_id}
                      className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4 border border-slate-600/50 hover:border-purple-500/50 transition-colors"
                    >
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => navigate(`/profile/${friend.user_id}`)}
                      >
                        {friend.profile_picture ? (
                          <img
                            src={friend.profile_picture}
                            alt={friend.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-semibold">{friend.username}</h3>
                          {friend.bio && (
                            <p className="text-gray-400 text-sm">{friend.bio}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-300 text-sm">{friend.xp} XP</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GiftXPButton friendId={friend.user_id} onGiveXP={handleGiveXP} />
                        <button
                          onClick={() => handleRemoveFriend(friend.user_id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                          title="Remove friend"
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No friends yet</p>
              )}
            </div>
          )}

          {activeTab === 'requests' && isOwnProfile && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Friend Requests</h2>
              {requestsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : friendRequests.length > 0 ? (
                <div className="space-y-3">
                  {friendRequests.map((request) => (
                    <div
                      key={request.user_id}
                      className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4 border border-slate-600/50"
                    >
                      <div className="flex items-center gap-4">
                        {request.profile_picture ? (
                          <img
                            src={request.profile_picture}
                            alt={request.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-semibold">{request.username}</h3>
                          {request.bio && (
                            <p className="text-gray-400 text-sm">{request.bio}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            Sent {formatDate(request.requested_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespondToRequest(request.user_id, 'accept')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request.user_id, 'reject')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No friend requests</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
