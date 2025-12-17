import { Link } from 'react-router-dom'
import { useUser } from '../services/authServices'
import { useDashboardStats } from '../services/dashboardServices'
import { Clock, BookOpen, Trophy, Users, Award, BarChart3, LayoutDashboard } from 'lucide-react'

export default function StudentDashboardPage() {
  const { data: currentUser } = useUser()
  const user = currentUser?.data?.user || currentUser?.user || currentUser
  const { data: statsData, isLoading: statsLoading } = useDashboardStats()

  const stats = statsData?.data || {
    totalStudyTime: 0,
    weeklyStudyTime: 0,
    weeklyGoal: 1200,
    activeCommunities: 0,
    xp: 0,
    currentRank: 0
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white">Loading dashboard...</div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, subtext, iconColor }) => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:bg-slate-800/70 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-slate-300 text-sm mb-1">{label}</div>
        {subtext && <div className="text-slate-500 text-xs">{subtext}</div>}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="text-indigo-400" size={40} />
            Dashboard
          </h1>
          <p className="text-slate-400">
            Overview of your study activities and progress.
          </p>
        </div>

        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.username || user?.user_name || 'Student'}!
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Clock}
            label="Total Study Time"
            value={`${Math.floor(stats.totalStudyTime / 60)}h ${stats.totalStudyTime % 60}m`}
            subtext="All time"
            iconColor="bg-blue-600"
          />
          <StatCard
            icon={BookOpen}
            label="Active Communities"
            value={stats.activeCommunities}
            subtext="Currently participating"
            iconColor="bg-purple-600"
          />
          <StatCard
            icon={Trophy}
            label="XP Points"
            value={stats.xp.toLocaleString()}
            subtext={`Rank #${stats.currentRank}`}
            iconColor="bg-yellow-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/timer"
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors group"
            >
              <Clock size={20} className="text-indigo-400 mb-2" />
              <div className="text-white font-medium mb-1">Start Studying</div>
              <div className="text-slate-400 text-sm">Begin a study session</div>
            </Link>
            <Link
              to="/communities"
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors group"
            >
              <Users size={20} className="text-purple-400 mb-2" />
              <div className="text-white font-medium mb-1">Join Community</div>
              <div className="text-slate-400 text-sm">Find study groups</div>
            </Link>
            <Link
              to="/achievements"
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors group"
            >
              <Award size={20} className="text-yellow-400 mb-2" />
              <div className="text-white font-medium mb-1">Achievements</div>
              <div className="text-slate-400 text-sm">View your achievements</div>
            </Link>
            <Link
              to="/statistics"
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors group"
            >
              <BarChart3 size={20} className="text-green-400 mb-2" />
              <div className="text-white font-medium mb-1">Statistics</div>
              <div className="text-slate-400 text-sm">View your stats</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
