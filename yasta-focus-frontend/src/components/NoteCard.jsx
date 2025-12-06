import { Users } from 'lucide-react'

export default function NoteCard({ note }) {
  const { title, createdAt, preview, collaborators, thumbnail } = note

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer">
      {/* Thumbnail/Preview Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
        {/* Placeholder for thumbnail - replace with actual image when available */}
        <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-6xl">
          📄
        </div>
        
        {/* Collaborator Avatars */}
        {collaborators > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1">
            {[...Array(Math.min(collaborators, 3))].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center -ml-2 first:ml-0"
                style={{ zIndex: 10 - i }}
              >
                <img
                  src={`https://i.pravatar.cc/32?img=${i + 10}`}
                  alt="Collaborator"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ))}
            {collaborators > 3 && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-slate-800 flex items-center justify-center text-xs font-semibold text-white -ml-2">
                +{collaborators - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
          {preview}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Created: {createdAt}</span>
          {collaborators > 0 && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{collaborators}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
      </div>
    </div>
  )
}
