import { useUser } from '../services/authServices'
import { Users, BookOpen, Trophy, MessageSquare, TrendingUp, Activity } from 'lucide-react'

export default function AdminStatisticsPage() {
  // Mock data - will be replaced with real API calls
  const stats = {
    totalUsers: 1250,
    totalCommunities: 45,
    totalStudyRooms: 320,
    totalCompetitions: 28,
    totalStudyTime: 45670, // in minutes
    activeUsers: 420,
    newUsersThisMonth: 85,
    avgSessionTime: 45 // in minutes
  }

  const StatCard = ({ icon: Icon, label, value, trend, iconColor }) => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconColor}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp size={16} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
        <div className="text-slate-400 text-sm">{label}</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Platform Statistics
          </h1>
          <p className="text-slate-400">
            Overview of all platform activities and metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            trend="+12%"
            iconColor="bg-blue-600"
          />
          <StatCard
            icon={BookOpen}
            label="Total Communities"
            value={stats.totalCommunities}
            trend="+8%"
            iconColor="bg-purple-600"
          />
          <StatCard
            icon={MessageSquare}
            label="Study Rooms"
            value={stats.totalStudyRooms}
            trend="+15%"
            iconColor="bg-green-600"
          />
          <StatCard
            icon={Trophy}
            label="Competitions"
            value={stats.totalCompetitions}
            trend="+5%"
            iconColor="bg-yellow-600"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-indigo-400" size={20} />
              <h3 className="text-white font-semibold">Active Users</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.activeUsers}</div>
            <div className="text-slate-400 text-sm">Currently online</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-green-400" size={20} />
              <h3 className="text-white font-semibold">New Users</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.newUsersThisMonth}</div>
            <div className="text-slate-400 text-sm">This month</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-yellow-400" size={20} />
              <h3 className="text-white font-semibold">Avg Session</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.avgSessionTime}m</div>
            <div className="text-slate-400 text-sm">Per user</div>
          </div>
        </div>

        {/* Study Time Overview */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-white font-semibold text-lg mb-4">
            Total Study Time
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {Math.floor(stats.totalStudyTime / 60).toLocaleString()}
            </span>
            <span className="text-2xl text-slate-400">hours</span>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Across all users and communities
          </p>
        </div>
      </div>
    </div>
  )
}
