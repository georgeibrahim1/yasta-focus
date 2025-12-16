import React, { useState, useMemo } from 'react';
import { Trophy, Star, Award, Lock, Users, Clock, Target, Zap } from 'lucide-react';
import { useGetAllAchievements, useGetAchievementStats } from '../services/achievementServices/hooks/useAchievements';
import AchievementCard from '../components/AchievementCard';

// Define custom category mappings
const CATEGORY_MAPPINGS = {
  'Study': ['sessions', 'Focus_sessions', 'SessionCount'],
  'Time': ['time'],
  'Social': ['communitiesJoined', 'communitiesCreated', 'communitiesCount', 'Friend', 'FriendRequest'],
  'Milestones': ['Level', 'XP']
};

// Category icons for visual appeal
const CATEGORY_ICONS = {
  'Study': Clock,
  'Time': Target,
  'Social': Users,
  'Milestones': Zap
};

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

  // Get available categories based on achievements
  const categories = useMemo(() => {
    const availableCategories = ['All'];
    const criteriaTypesInData = new Set(achievements.map(a => a.criteriatype));
    
    // Only add categories that have achievements
    Object.keys(CATEGORY_MAPPINGS).forEach(category => {
      const hasAchievements = CATEGORY_MAPPINGS[category].some(type => 
        criteriaTypesInData.has(type)
      );
      if (hasAchievements) {
        availableCategories.push(category);
      }
    });
    
    return availableCategories;
  }, [achievements]);

  // Filter achievements by custom category and sort by unlocked status
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    if (selectedCategory !== 'All') {
      const criteriaTypes = CATEGORY_MAPPINGS[selectedCategory] || [];
      filtered = achievements.filter(a => criteriaTypes.includes(a.criteriatype));
    }
    
    // Sort: unlocked first (unlocked = true), then locked (unlocked = false)
    return [...filtered].sort((a, b) => {
      // If a is unlocked and b is not, a comes first
      if (a.unlocked && !b.unlocked) return -1;
      // If b is unlocked and a is not, b comes first
      if (!a.unlocked && b.unlocked) return 1;
      // Both same status, maintain order
      return 0;
    });
  }, [achievements, selectedCategory]);

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
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50'
                  }`}
                >
                  {Icon && <Icon size={18} />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="text-slate-400 text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <Lock size={48} className="mx-auto mb-4 text-slate-600" />
            <p>No achievements found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}