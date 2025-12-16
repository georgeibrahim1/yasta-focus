import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetUserProfile, useUpdateUserProfile } from '../services/userServices'
import {
  useGetFriends,
  useGetFriendRequests,
  useRespondToFriendRequest,
  useRemoveFriend,
  useGiveXPToFriend
} from '../services/friendshipServices'
import { leaderboardService } from '../services/leaderboardServices/service'
import { useCheckInStatus } from '../services/leaderboardServices'
import { useUser, useLogout } from '../services/authServices'
import { useGetAllAchievements } from '../services/achievementServices'
import ProtectedComponent from '../components/ProtectedComponent'
import AchievementCard from '../components/AchievementCard'
import { api } from '../services/api'
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
  Star,
  Save,
  Lock,
  Eye,
  EyeOff,
  LogOut
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
  const updateProfileMutation = useUpdateUserProfile()
  const logoutMutation = useLogout()

  const isOwnProfile = !userId || userId === currentUser?.user?.user_id
  
  // Editing states
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [isEditingInterests, setIsEditingInterests] = useState(false)
  const [editedUsername, setEditedUsername] = useState('')
  const [editedBio, setEditedBio] = useState('')
  const [editedInterests, setEditedInterests] = useState([])
  const [newInterest, setNewInterest] = useState('')
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  
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

  const handleSaveUsername = async () => {
    if (editedUsername && editedUsername !== profile.username) {
      try {
        await updateProfileMutation.mutateAsync({ username: editedUsername })
        setIsEditingUsername(false)
      } catch {
        alert('Error updating username')
      }
    } else {
      setIsEditingUsername(false)
    }
  }

  const handleSaveBio = async () => {
    if (editedBio !== profile.bio) {
      try {
        await updateProfileMutation.mutateAsync({ bio: editedBio })
        setIsEditingBio(false)
      } catch {
        alert('Error updating bio')
      }
    } else {
      setIsEditingBio(false)
    }
  }

  const handleSaveInterests = async () => {
    if (JSON.stringify(editedInterests) !== JSON.stringify(profile.interests)) {
      try {
        await updateProfileMutation.mutateAsync({ interests: editedInterests })
        setIsEditingInterests(false)
      } catch {
        alert('Error updating interests')
      }
    } else {
      setIsEditingInterests(false)
    }
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !editedInterests.includes(newInterest.trim())) {
      setEditedInterests([...editedInterests, newInterest.trim()])
      setNewInterest('')
    }
  }

  const handleRemoveInterest = (interest) => {
    setEditedInterests(editedInterests.filter(i => i !== interest))
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })

    if (passwordData.password !== passwordData.passwordConfirm) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (passwordData.password.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    try {
      await api.patch('/api/auth/updateMyPassword', passwordData)
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      // Clear all password fields immediately
      setPasswordData({ passwordCurrent: '', password: '', passwordConfirm: '' })
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setTimeout(() => {
        setPasswordMessage({ type: '', text: '' })
      }, 2000)
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password' 
      })
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
                {/* Username Editing */}
                {isOwnProfile && isEditingUsername ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      className="text-2xl font-bold bg-slate-700 text-white px-3 py-1 rounded-lg border border-purple-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveUsername}
                      className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                      title="Save"
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditingUsername(false)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                    {isOwnProfile && (
                      <button
                        onClick={() => {
                          setEditedUsername(profile.username)
                          setIsEditingUsername(true)
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Edit username"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                )}
                
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
                
                {/* Bio Editing */}
                {isOwnProfile && isEditingBio ? (
                  <div className="mb-3">
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-purple-500 focus:outline-none resize-none"
                      rows="3"
                      placeholder="Write your bio..."
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveBio}
                        className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors text-sm flex items-center gap-1"
                      >
                        <Save size={14} />
                        Save Bio
                      </button>
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {profile.bio && (
                      <div className="mb-3 flex items-start gap-2">
                        <p className="text-gray-300 max-w-2xl">{profile.bio}</p>
                        {isOwnProfile && (
                          <button
                            onClick={() => {
                              setEditedBio(profile.bio || '')
                              setIsEditingBio(true)
                            }}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Edit bio"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    {!profile.bio && isOwnProfile && (
                      <button
                        onClick={() => {
                          setEditedBio('')
                          setIsEditingBio(true)
                        }}
                        className="text-slate-400 hover:text-white text-sm mb-3 flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Add bio
                      </button>
                    )}
                  </>
                )}
                
                {/* Interests Editing */}
                {isOwnProfile && isEditingInterests ? (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editedInterests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm flex items-center gap-1"
                        >
                          {interest}
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                        placeholder="Add interest..."
                        className="flex-1 bg-slate-700 text-white px-3 py-1 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none text-sm"
                      />
                      <button
                        onClick={handleAddInterest}
                        className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveInterests}
                        className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors text-sm flex items-center gap-1"
                      >
                        <Save size={14} />
                        Save Interests
                      </button>
                      <button
                        onClick={() => setIsEditingInterests(false)}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {profile.interests && profile.interests.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                        {isOwnProfile && (
                          <button
                            onClick={() => {
                              setEditedInterests(profile.interests || [])
                              setIsEditingInterests(true)
                            }}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Edit interests"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                      </div>
                    )}
                    {(!profile.interests || profile.interests.length === 0) && isOwnProfile && (
                      <button
                        onClick={() => {
                          setEditedInterests([])
                          setIsEditingInterests(true)
                        }}
                        className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Add interests
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              {getFriendshipButton()}
              {isOwnProfile && (
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
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
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'password'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </div>
            </button>
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
                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-300 mb-2">Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
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

          {activeTab === 'password' && isOwnProfile && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
              
              {passwordMessage.text && (
                <div
                  className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-600/20 border-green-500/50 text-green-400'
                      : 'bg-red-600/20 border-red-500/50 text-red-400'
                  }`}
                >
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.passwordCurrent}
                      onChange={(e) => setPasswordData({ ...passwordData, passwordCurrent: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.password}
                      onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Enter new password (min 8 characters)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.passwordConfirm}
                      onChange={(e) => setPasswordData({ ...passwordData, passwordConfirm: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
