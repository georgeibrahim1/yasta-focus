import { useUser } from '../services/authServices'
import { 
  useGetPlatformStats, 
  useGetTopUsers, 
  useGetRecentUsers, 
  useGetActiveCommunities 
} from '../services/adminServices'
import { Users, BookOpen, Clock, Target, TrendingUp, Award, LayoutDashboard } from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: currentUser } = useUser()
  const user = currentUser?.data?.user || currentUser?.user || currentUser

  const { data: platformStats, isLoading: statsLoading } = useGetPlatformStats()
  const { data: topUsersData, isLoading: topUsersLoading } = useGetTopUsers(5)
  const { data: recentUsersData, isLoading: recentUsersLoading } = useGetRecentUsers(5)
  const { data: activeCommunitiesData, isLoading: communitiesLoading } = useGetActiveCommunities(5)

  const stats = platformStats?.data || {}
  const topUsers = topUsersData?.data?.users || []
  const recentUsers = recentUsersData?.data?.users || []
  const activeCommunities = activeCommunitiesData?.data?.communities || []

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="text-indigo-400" size={40} />
            Admin Dashboard
          </h1>
          <p className="text-slate-400">
            Manage and monitor platform activities and statistics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-blue-400" />
              <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                <span className="text-blue-300 text-xs font-semibold">Total</span>
              </div>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalUsers?.toLocaleString() || 0}
              </div>
            )}
            <p className="text-slate-400 text-sm">Registered Users</p>
            <p className="text-blue-400 text-xs mt-2">
              {stats.activeUsers || 0} active (7 days)
            </p>
          </div>

          {/* Total Communities */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-10 h-10 text-purple-400" />
              <div className="bg-purple-500/20 px-3 py-1 rounded-full">
                <span className="text-purple-300 text-xs font-semibold">Total</span>
              </div>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalCommunities?.toLocaleString() || 0}
              </div>
            )}
            <p className="text-slate-400 text-sm">Communities</p>
          </div>

          {/* Total Study Time */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-green-400" />
              <div className="bg-green-500/20 px-3 py-1 rounded-full">
                <span className="text-green-300 text-xs font-semibold">All Time</span>
              </div>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalStudyHours?.toLocaleString() || 0}h
              </div>
            )}
            <p className="text-slate-400 text-sm">Total Study Time</p>
            <p className="text-green-400 text-xs mt-2">
              {stats.totalSessions?.toLocaleString() || 0} sessions
            </p>
          </div>

          {/* Total Content */}
          <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-10 h-10 text-orange-400" />
              <div className="bg-orange-500/20 px-3 py-1 rounded-full">
                <span className="text-orange-300 text-xs font-semibold">Content</span>
              </div>
            </div>
            {statsLoading ? (
              <div className="h-8 bg-slate-700 rounded animate-pulse mb-2"></div>
            ) : (
              <div className="text-3xl font-bold text-white mb-1">
                {((stats.totalTasks || 0) + (stats.totalFlashcards || 0) + (stats.totalNotes || 0)).toLocaleString()}
              </div>
            )}
            <p className="text-slate-400 text-sm">Total Items</p>
            <p className="text-orange-400 text-xs mt-2">
              {stats.totalTasks || 0} tasks • {stats.totalFlashcards || 0} cards • {stats.totalNotes || 0} notes
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Users */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Top Users by XP</h2>
            </div>
            {topUsersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : topUsers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <div key={user.user_id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{user.username}</p>
                      <p className="text-slate-400 text-sm truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{user.xp?.toLocaleString()} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Recent Users</h2>
            </div>
            {recentUsersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{user.username}</p>
                      <p className="text-slate-400 text-sm truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Communities */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Most Active Communities</h2>
          </div>
          {communitiesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : activeCommunities.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No communities yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCommunities.map((community) => (
                <div key={community.community_id} className="p-4 bg-slate-700/50 rounded-lg">
                  <h3 className="text-white font-semibold mb-1 truncate">{community.community_name}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{community.community_description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400">
                      {community.member_count} members
                    </span>
                    <span className="text-slate-400">
                      {community.room_count} rooms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
