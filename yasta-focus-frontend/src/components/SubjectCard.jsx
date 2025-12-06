export default function SubjectCard({ subject, isActive, onClick }) {
  const { name, icon } = subject

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
        isActive
          ? 'bg-slate-800 border border-slate-700 shadow-lg'
          : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50 hover:border-slate-700'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
        isActive
          ? 'bg-indigo-500/20'
          : 'bg-slate-700/50'
      }`}>
        {icon}
      </div>
      <span className={`font-medium transition-colors ${
        isActive
          ? 'text-white'
          : 'text-slate-400'
      }`}>
        {name}
      </span>
    </button>
  )
}
