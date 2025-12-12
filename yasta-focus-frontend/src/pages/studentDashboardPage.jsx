import { useUser } from '../services/authServices'
import { Clock, BookOpen, Trophy, Users, Target } from 'lucide-react'

export default function StudentDashboardPage() {
  const { data: currentUser } = useUser()
  const user = currentUser?.data?.user || currentUser?.user || currentUser

  // Mock data - will be replaced with real API calls
  const stats = {
    totalStudyTime: 2450, // minutes
    weeklyGoal: 1200, // minutes
    activeCommunities: 3,
    completedSubjects: 8,
    currentRank: 42,
    xp: user?.xp || 0
  }

  const weeklyProgress = Math.min(100, (stats.totalStudyTime / stats.weeklyGoal) * 100)

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
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Welcome back, {user?.user_name || 'Student'}!
          </h1>
          <p className="text-slate-400">
            Here&apos;s your study overview and progress
          </p>
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

        {/* Weekly Goal Progress */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Target size={20} className="text-indigo-400" />
                Weekly Goal
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {stats.totalStudyTime} / {stats.weeklyGoal} minutes
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{Math.round(weeklyProgress)}%</div>
              <div className="text-slate-400 text-xs">Complete</div>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-white font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/timer"
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors group"
            >
              <Clock size={20} className="text-indigo-400 mb-2" />
              <div className="text-white font-medium mb-1">Start Studying</div>
              <div className="text-slate-400 text-sm">Begin a study session</div>
            </a>
            <a
              href="/communities"
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors group"
            >
              <Users size={20} className="text-purple-400 mb-2" />
              <div className="text-white font-medium mb-1">Join Community</div>
              <div className="text-slate-400 text-sm">Find study groups</div>
            </a>
            <a
              href="/leaderboard"
              className="p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/50 transition-colors group"
            >
              <Trophy size={20} className="text-yellow-400 mb-2" />
              <div className="text-white font-medium mb-1">View Rankings</div>
              <div className="text-slate-400 text-sm">Check leaderboard</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
