// pages/AdminAchievementsPage.jsx
import { useState } from 'react';
import { Trophy, Plus, Edit, Trash2, X, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useAdminAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement
} from '../services/achievementServices/hooks/useAdminAchievements';

export default function AdminAchievementsPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    criteriatype: '',
    criteriavalue: '',
    xp: '',
    picture: '🏆'
  });

  const { data: achievements = [], isLoading } = useAdminAchievements();
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();

  // Popular achievement emojis
  const emojiOptions = [
    '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', '💎', '👑', '🎯',
  '🔥', '💪', '🚀', '📚', '📖', '✍️', '🎓', '🧠', '💡', '⚡',
  '🎨', '🎭', '🎪', '🎬', '🎮', '🏅', '🎖️', '🥳', '🎉', '🎊',
  '💯', '✅', '🔔', '📢', '🌈', '☀️', '🌙', '⏰', '⏱️', '📅',
  '🌍', '🌎', '🌏', '🏘️', '🏛️', '🤝', '👥',
  '🫂', '🌐', '📝', '📕', '📗', '📘', '📙', '📓', '📔', '🗂️',
  '📑', '⏲️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '⌛',
  '⏳', '💫', '💕', '💖', '💗', '💙', '💚', '🤗', '🎚️', '📊',
  '📈', '🔝', '⬆️', '🆙', '🔼', '⏫', '📶', '🎢', '🪜', '💥'
  ];

  // Criteria type options
  const criteriaTypes = [
    { value: 'sessions', label: 'Study Sessions' },
    { value: 'Focus_sessions', label: 'Focus Sessions' },
    { value: 'time', label: 'Study Time (minutes)' },
    { value: 'SessionCount', label: 'Daily Session Count' },
    { value: 'communitiesJoined', label: 'Communities Joined' },
    { value: 'communitiesCreated', label: 'Communities Created' },
    { value: 'communitiesCount', label: 'Community Members' },
    { value: 'Friend', label: 'Friends Count' },
    { value: 'FriendRequest', label: 'Friend Requests Sent' },
    { value: 'Level', label: 'User Level' },
    { value: 'XP', label: 'Total XP' }
  ];

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || achievement.criteriatype === filterType;
    return matchesSearch && matchesType;
  });

  // Group by criteria type
  const groupedAchievements = filteredAchievements.reduce((acc, achievement) => {
    const type = achievement.criteriatype;
    if (!acc[type]) acc[type] = [];
    acc[type].push(achievement);
    return acc;
  }, {});

  const handleOpenModal = (achievement = null) => {
    if (achievement) {
      setEditingAchievement(achievement);
      setFormData({
        title: achievement.title,
        description: achievement.description || '',
        criteriatype: achievement.criteriatype,
        criteriavalue: achievement.criteriavalue.toString(),
        xp: achievement.xp.toString(),
        picture: achievement.picture || '🏆'
      });
    } else {
      setEditingAchievement(null);
      setFormData({
        title: '',
        description: '',
        criteriatype: '',
        criteriavalue: '',
        xp: '',
        picture: '🏆'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAchievement(null);
    setFormData({
      title: '',
      description: '',
      criteriatype: '',
      criteriavalue: '',
      xp: '',
      picture: '🏆'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const achievementData = {
      title: formData.title,
      description: formData.description,
      criteriatype: formData.criteriatype,
      criteriavalue: parseInt(formData.criteriavalue),
      xp: parseInt(formData.xp),
      picture: formData.picture
    };

    if (editingAchievement) {
      await updateMutation.mutateAsync({
        id: editingAchievement.id,
        achievementData
      });
    } else {
      await createMutation.mutateAsync(achievementData);
    }

    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this achievement? This cannot be undone.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
                <Trophy className="text-yellow-400" size={40} />
                Achievement Management
              </h1>
              <p className="text-slate-400">
                Create and manage achievements for the platform.
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors"
            >
              <Plus size={20} />
              Create Achievement
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="w-64">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                {criteriaTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Achievements List */}
        {isLoading ? (
          <div className="text-center text-slate-400 py-12">Loading achievements...</div>
        ) : Object.keys(groupedAchievements).length === 0 ? (
          <div className="text-center text-slate-400 py-12 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
            No achievements found. Create your first one!
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAchievements).map(([type, typeAchievements]) => (
              <div key={type} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="text-yellow-400" size={20} />
                  {criteriaTypes.find(ct => ct.value === type)?.label || type}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeAchievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 hover:border-indigo-500/50 transition group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-3xl">{achievement.picture || '🏆'}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold mb-1">{achievement.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2">
                              {achievement.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(achievement)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-indigo-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(achievement.id)}
                            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                          Requires: <span className="text-white font-semibold">{achievement.criteriavalue}</span>
                        </span>
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full font-semibold">
                          +{achievement.xp} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-3xl border border-slate-700/50 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Trophy size={24} className="text-yellow-400" />
                {editingAchievement ? 'Edit Achievement' : 'Create Achievement'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-5">
                <div>
                  <label className="block text-slate-300 text-base font-medium mb-3">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., First Study Session"
                    className="w-full px-5 py-4 text-base bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-base font-medium mb-3">
                    Description*
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the achievement and what it takes to unlock it..."
                    className="w-full px-5 py-4 text-base bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Criteria Section */}
              <div className="space-y-5">
                <div>
                  <label className="block text-slate-300 text-base font-medium mb-3">
                    Criteria Type *
                  </label>
                  <select
                    value={formData.criteriatype}
                    onChange={(e) => setFormData({ ...formData, criteriatype: e.target.value })}
                    className="w-full px-5 py-4 text-base bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                  >
                    <option value="">Select type...</option>
                    {criteriaTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-300 text-base font-medium mb-3">
                      Required Value *
                    </label>
                    <input
                      type="number"
                      value={formData.criteriavalue}
                      onChange={(e) => setFormData({ ...formData, criteriavalue: e.target.value })}
                      placeholder="e.g., 10"
                      className="w-full px-5 py-4 text-base bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-base font-medium mb-3">
                      XP Reward *
                    </label>
                    <input
                      type="number"
                      value={formData.xp}
                      onChange={(e) => setFormData({ ...formData, xp: e.target.value })}
                      placeholder="e.g., 50"
                      className="w-full px-5 py-4 text-base bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      required
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700/50 my-6"></div>

              {/* Emoji Icon Section */}
              <div>
                <label className="block text-slate-300 text-base font-medium mb-4">
                  Achievement Icon
                </label>

                {/* Preview */}
                <div className="flex items-center gap-4 mb-5 p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl">
                  <div className="w-20 h-20 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <div className="text-5xl">{formData.picture || '🏆'}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">Selected Icon</p>
                    <p className="text-slate-400 text-sm">
                      Choose an emoji from the options below
                    </p>
                  </div>
                </div>

                {/* Emoji Picker */}
                <div className="grid grid-cols-12 gap-3 p-5 bg-slate-700/30 border border-slate-600/30 rounded-xl max-h-64 overflow-y-auto">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, picture: emoji })}
                      className={`text-3xl w-14 h-14 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                        formData.picture === emoji
                          ? 'bg-indigo-600 ring-2 ring-indigo-400 shadow-lg'
                          : 'hover:bg-slate-600/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-4 px-6 text-base bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-4 px-6 text-base bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-semibold shadow-lg shadow-indigo-500/20"
                >
                  {(createMutation.isPending || updateMutation.isPending)
                    ? 'Saving...'
                    : editingAchievement
                    ? 'Update Achievement'
                    : 'Create Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}