import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Info, 
  Users, 
  Megaphone, 
  BarChart3, 
  ArrowLeft, 
  Edit2, 
  LogOut,
  Save,
  X
} from 'lucide-react'
import { 
  useCommunityStats,
  useUpdateCommunityInfo,
  useUpdateMemberBio,
  useExitCommunity
} from '../services/communityServices'
import { useUser } from '../services/authServices'
import StudyRoomList from '../components/StudyRoomList'
import AnnouncementWidget from '../components/AnnouncementWidget'
import ProtectedComponent from '../components/ProtectedComponent'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function CommunityDetailPage() {
  const { communityId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('rooms')
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [communityDescription, setCommunityDescription] = useState('')
  const [memberBio, setMemberBio] = useState('')

  const { data: currentUser } = useUser()
  const { data: stats, isLoading: statsLoading } = useCommunityStats(communityId)
  const updateInfo = useUpdateCommunityInfo()
  const updateBio = useUpdateMemberBio()
  const exitCommunity = useExitCommunity()
  
  // TODO: Replace with actual check from community data
  const isManager = true // Placeholder - should check communitymanagers table

  const tabs = [
    { id: 'rooms', label: 'Study Rooms', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'info', label: 'Info', icon: Info },
  ]

  if (isManager) {
    tabs.push({ id: 'stats', label: 'Statistics', icon: BarChart3 })
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    try {
      await updateInfo.mutateAsync({
        communityId,
        communityData: {
          community_Name: communityName,
          community_Description: communityDescription
        }
      })
      setIsEditingInfo(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleUpdateBio = async (e) => {
    e.preventDefault()
    try {
      await updateBio.mutateAsync({
        communityId,
        bio: memberBio
      })
      setIsEditingBio(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleExitCommunity = async () => {
    if (window.confirm('Are you sure you want to leave this community?')) {
      try {
        await exitCommunity.mutateAsync(communityId)
        navigate('/communities')
      } catch (error) {
        // Error handled by mutation
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Community Name {/* TODO: Get from API */}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Community description goes here {/* TODO: Get from API */}
              </p>
            </div>
            
            <button
              onClick={handleExitCommunity}
              disabled={exitCommunity.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut size={18} />
              Leave Community
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'rooms' && (
            <StudyRoomList communityId={communityId} />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementWidget communityId={communityId} isManager={isManager} />
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Community Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Community Information
                  </h2>
                  <ProtectedComponent permissionCheck={() => isManager}>
                    {!isEditingInfo ? (
                      <button
                        onClick={() => {
                          setIsEditingInfo(true)
                          setCommunityName('') // TODO: Set from actual data
                          setCommunityDescription('') // TODO: Set from actual data
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingInfo(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </ProtectedComponent>
                </div>

                {isEditingInfo ? (
                  <form onSubmit={handleUpdateInfo} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Community Name
                      </label>
                      <input
                        type="text"
                        value={communityName}
                        onChange={(e) => setCommunityName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={communityDescription}
                        onChange={(e) => setCommunityDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows={4}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={updateInfo.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateInfo.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                ) : (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Community Name {/* TODO */}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Community description {/* TODO */}
                    </p>
                  </div>
                )}
              </div>

              {/* Member Bio */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    My Bio in this Community
                  </h2>
                  {!isEditingBio ? (
                    <button
                      onClick={() => {
                        setIsEditingBio(true)
                        setMemberBio('') // TODO: Set from actual data
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {isEditingBio ? (
                  <form onSubmit={handleUpdateBio} className="space-y-4">
                    <textarea
                      value={memberBio}
                      onChange={(e) => setMemberBio(e.target.value)}
                      placeholder="Tell other members about yourself..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      rows={4}
                    />
                    <button
                      type="submit"
                      disabled={updateBio.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateBio.isPending ? 'Saving...' : 'Save Bio'}
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Your bio... {/* TODO */}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && isManager && (
            <div className="space-y-6">
              {statsLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ) : stats ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Members</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Study Rooms</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRooms}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Members</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeMembers}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Announcements</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalAnnouncements}</p>
                    </div>
                  </div>

                  {/* Member Growth Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Member Growth (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.memberTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="newMembers" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Failed to load statistics</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
