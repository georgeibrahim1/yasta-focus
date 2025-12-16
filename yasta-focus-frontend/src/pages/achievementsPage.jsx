import React, { useState, useMemo } from 'react';
import { Trophy, Star, Award, Lock } from 'lucide-react';
import { useGetAllAchievements, useGetAchievementStats } from '../services/achievementServices/hooks/useAchievements';
import AchievementCard from '../components/AchievementCard';

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { data: achievementsData, isLoading: achievementsLoading } = useGetAllAchievements();
  const { data: statsData, isLoading: statsLoading } = useGetAchievementStats();

  const achievements = achievementsData || [];
  const stats = statsData || {
    level: 1,
    totalXP: 0,
    xpInCurrentLevel: 0,
    xpToNextLevel: 100,
    unlockedCount: 0,
    totalAchievements: 0
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(achievements.map(a => a.criteriatype))];
    return cats;
  }, [achievements]);

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'All') return achievements;
    return achievements.filter(a => a.criteriatype === selectedCategory);
  }, [achievements, selectedCategory]);

  // Group achievements by category for display
  const groupedAchievements = useMemo(() => {
    const grouped = {};
    filteredAchievements.forEach(achievement => {
      const category = achievement.criteriatype;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(achievement);
    });
    return grouped;
  }, [filteredAchievements]);

  const levelProgress = (stats.xpInCurrentLevel / (stats.xpInCurrentLevel + stats.xpToNextLevel)) * 100;

  if (achievementsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-400" size={40} />
            Achievements
          </h1>
          <p className="text-slate-400">
            Track your progress and unlock achievements as you study.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Level Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-yellow-600">
                <Star size={24} className="text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.level}</div>
            <div className="text-slate-300 text-sm">Level</div>
          </div>

          {/* Total XP Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-600">
                <Trophy size={24} className="text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalXP}</div>
            <div className="text-slate-300 text-sm">Total XP</div>
          </div>

          {/* Unlocked Achievements Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-purple-600">
                <Award size={24} className="text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">
              {stats.unlockedCount}/{stats.totalAchievements}
            </div>
            <div className="text-slate-300 text-sm">Achievements</div>
          </div>

          {/* Next Level Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-indigo-600">
                <Star size={24} className="text-white" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.xpToNextLevel}</div>
            <div className="text-slate-300 text-sm">XP to go</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">Level Progress</h3>
              <p className="text-slate-400 text-sm mt-1">
                {stats.xpInCurrentLevel} / {stats.xpInCurrentLevel + stats.xpToNextLevel} XP
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{Math.round(levelProgress)}%</div>
              <div className="text-slate-400 text-xs">to Level {stats.level + 1}</div>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid - Grouped by Category */}
        {Object.keys(groupedAchievements).length === 0 ? (
          <div className="text-slate-400 text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <Lock size={48} className="mx-auto mb-4 text-slate-600" />
            <p>No achievements found in this category</p>
          </div>
        ) : (
          Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 flex-1 bg-slate-700/50 rounded" />
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-full">
                    {category}
                  </span>
                </h2>
                <div className="h-1 flex-1 bg-slate-700/50 rounded" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}