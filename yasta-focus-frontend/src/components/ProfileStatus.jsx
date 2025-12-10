export default function ProfileStatus({ 
  name = 'User', 
  level = 0, 
  xp = 0, 
  maxXp = 100, 
  avatarUrl = null 
}) {
  const xpPercentage = Math.min((xp / maxXp) * 100, 100)

  return (
    <div className="flex items-center gap-3 bg-slate-700/50 backdrop-blur-sm rounded-full px-3 py-2 border border-slate-600/50">
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
          <span className="text-xs text-slate-400">XP {maxXp}</span>
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
