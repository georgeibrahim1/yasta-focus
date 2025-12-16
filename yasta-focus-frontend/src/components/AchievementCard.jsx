import React from 'react';
import { Lock, Trophy } from 'lucide-react';

export default function AchievementCard({ achievement }) {
  const { title, description, xp, unlocked, picture, criteriatype } = achievement;

  return (
    <div
      className={`relative rounded-xl p-6 border transition-all duration-300 ${
        unlocked
          ? 'bg-gradient-to-br from-slate-800/70 to-slate-700/70 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
          : 'bg-slate-800/30 border-slate-700/50 opacity-60'
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
          className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${
            unlocked ? 'bg-indigo-600' : 'bg-slate-700'
          }`}
        >
          {picture || '🏆'}
        </div>

        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-1 ${unlocked ? 'text-white' : 'text-slate-400'}`}>
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                unlocked ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-700/50 text-slate-500'
              }`}
            >
              {criteriatype}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className={`text-sm mb-4 ${unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
        {description}
      </p>

      {/* XP Badge */}
      <div className="flex items-center justify-between">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            unlocked
              ? 'bg-yellow-600/20 border border-yellow-600/30'
              : 'bg-slate-700/30 border border-slate-600/30'
          }`}
        >
          <Trophy size={16} className={unlocked ? 'text-yellow-400' : 'text-slate-500'} />
          <span className={`font-bold text-sm ${unlocked ? 'text-yellow-300' : 'text-slate-500'}`}>
            +{xp} XP
          </span>
        </div>

        {/* {unlocked && (
          <div className="px-3 py-1 bg-green-600/20 border border-green-600/30 rounded-lg">
            <span className="text-green-400 text-xs font-semibold">UNLOCKED</span>
          </div>
        )} */}
      </div>

      {/* Glow Effect for Unlocked */}
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}