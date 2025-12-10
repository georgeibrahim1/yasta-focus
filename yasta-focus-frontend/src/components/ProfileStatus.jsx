import { useNavigate } from 'react-router-dom'
import { useUser } from '../services/authServices'

export default function ProfileStatus() {
  const navigate = useNavigate()
  const { data: userData, isLoading, isError } = useUser()

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm rounded-full px-3 py-2 border border-slate-600/50 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-slate-600" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-slate-600 rounded w-24" />
          <div className="h-3 bg-slate-600 rounded w-16" />
        </div>
      </div>
    )
  }

  // Handle error or no data - show default state
  if (isError || !userData) {
    return (
      <div 
        onClick={() => navigate('/profile')}
        className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm rounded-full px-3 py-2 border border-slate-600/50 cursor-pointer hover:bg-slate-700/70 transition-colors"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
            U
          </div>
        </div>
        <div className="flex flex-col gap-0.5 flex-1 pr-2">
          <h2 className="text-sm font-semibold text-white">User</h2>
          <p className="text-xs text-slate-300">Level 0</p>
        </div>
      </div>
    )
  }

  // Try to extract user from different possible data structures
  const user = userData?.data?.user || userData?.user || userData
  if (!user) {
    return (
      <div 
        onClick={() => navigate('/profile')}
        className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm rounded-full px-3 py-2 border border-slate-600/50 cursor-pointer hover:bg-slate-700/70 transition-colors"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
            U
          </div>
        </div>
        <div className="flex flex-col gap-0.5 flex-1 pr-2">
          <h2 className="text-sm font-semibold text-white">User</h2>
          <p className="text-xs text-slate-300">Level 0</p>
        </div>
      </div>
    )
  }

  const name = user.username || 'User'
  const xp = user.xp || 0
  const avatarUrl = user.profile_picture || null
  
  // Calculate level based on XP (e.g., 100 XP per level)
  const level = Math.floor(xp / 100)
  const maxXp = (level + 1) * 100
  const currentLevelXp = xp - (level * 100)
  const xpPercentage = Math.min((currentLevelXp / 100) * 100, 100)

  return (
    <div 
      onClick={() => navigate('/profile')}
      className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm rounded-full px-3 py-2 border border-slate-600/50 cursor-pointer hover:bg-slate-700/70 transition-colors"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 flex-shrink-0">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 flex-1 pr-2">
        <h2 className="text-sm font-semibold text-white">{name}</h2>
        <p className="text-xs text-slate-300">Level {level}</p>
        
        {/* XP Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{currentLevelXp}/{100} XP</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mr-2">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
