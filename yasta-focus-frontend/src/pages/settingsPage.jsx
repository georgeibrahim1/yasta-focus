import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useLogout } from '../services/authServices'
import { useUpdateUserProfile } from '../services/userServices'
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  LogOut,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react'
import { api } from '../services/api'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { data: currentUser, isLoading: userLoading } = useUser()
  const updateProfile = useUpdateUserProfile()
  const logoutMutation = useLogout()

  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    username: '',
    bio: ''
  })

  // Initialize profile data when user data loads
  useEffect(() => {
    if (currentUser?.user) {
      setProfileData({
        username: currentUser.user.username || '',
        bio: currentUser.user.bio || ''
      })
    }
  }, [currentUser])

  const [passwordData, setPasswordData] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: ''
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)

    try {
      await updateProfile.mutateAsync(profileData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (passwordData.password !== passwordData.passwordConfirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (passwordData.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)

    try {
      const response = await api.patch('/api/auth/updateMyPassword', passwordData)
      setMessage({ type: 'success', text: response.data.message || 'Password updated successfully!' })
      setPasswordData({ passwordCurrent: '', password: '', passwordConfirm: '' })
      // Don't redirect to login - user stays on settings page
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logoutMutation.mutateAsync()
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to logout' })
      }
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Settings className="text-slate-400" size={40} />
            Settings
          </h1>
          <p className="text-slate-400">
            Manage your account preferences and privacy.
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-600/20 border-green-500/50 text-green-400'
                : 'bg-red-600/20 border-red-500/50 text-red-400'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </div>
          </button>
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
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Username
                    </div>
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4" />
                      Current Password
                    </div>
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
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4" />
                      New Password
                    </div>
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
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4" />
                      Confirm New Password
                    </div>
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
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors border border-red-600/30"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
