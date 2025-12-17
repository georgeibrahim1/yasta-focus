import React from 'react';
import { Lock, Trophy } from 'lucide-react';

export default function AchievementCard({ achievement }) {
  const { title, description, xp, unlocked, picture, criteriatype } = achievement;

  return (
    <div className="group relative">
      <div
        className={`relative rounded-xl p-6 border transition-all duration-300 ${
          unlocked
            ? 'bg-gradient-to-br from-slate-800/70 to-slate-700/70 border-indigo-500/50 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] hover:border-indigo-400/60'
            : 'bg-slate-800/30 border-slate-700/50 opacity-60 hover:opacity-70 hover:border-slate-600/60'
        }`}
      >
        {/* Locked Overlay */}
        {!unlocked && (
          <div className="absolute top-4 right-4">
            <Lock size={20} className="text-slate-500" />
          </div>
        )}

        {/* Achievement Icon/Picture */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl transition-all duration-300 ${
              unlocked 
                ? 'bg-indigo-600 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-indigo-500' 
                : 'bg-slate-700'
            }`}
          >
            {picture || '🏆'}
          </div>

          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${
              unlocked 
                ? 'text-white group-hover:text-indigo-200' 
                : 'text-slate-400'
            }`}>
              {title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm mb-4 ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
          {description}
        </p>

        {/* XP Badge */}
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              unlocked
                ? 'bg-yellow-600/20 border border-yellow-600/30 group-hover:bg-yellow-600/30 group-hover:border-yellow-500/40'
                : 'bg-slate-700/30 border border-slate-600/30'
            }`}
          >
            <Trophy size={16} className={unlocked ? 'text-yellow-400' : 'text-slate-500'} />
            <span className={`font-bold text-sm ${unlocked ? 'text-yellow-300' : 'text-slate-500'}`}>
              +{xp} XP
            </span>
          </div>
        </div>

        {/* Glow Effect for Unlocked */}
        {unlocked && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl pointer-events-none group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
        )}

        {/* Shine Effect on Hover (Unlocked Only) */}
        {unlocked && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        )}
      </div>

      {/* Outer Glow on Hover for Unlocked Achievements */}
      {unlocked && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
}