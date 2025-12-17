import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Award } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CompetitionLeaderboardModal({ competition, isOpen, onClose, communityId }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    if (isOpen && competition) {
      fetchLeaderboard();
    }
  }, [isOpen, competition]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/communities/${communityId}/competitions/${competition.competition_id}/leaderboard`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLeaderboardData(response.data.data || []);
      if (response.data.data && response.data.data.length > 0) {
        setSelectedSubject(response.data.data[0].subject_name);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !competition) return null;

  // Group leaderboard data by subject
  const subjectGroups = leaderboardData.reduce((acc, entry) => {
    if (!acc[entry.subject_name]) {
      acc[entry.subject_name] = [];
    }
    acc[entry.subject_name].push(entry);
    return acc;
  }, {});

  const subjects = Object.keys(subjectGroups);
  const currentSubjectData = subjectGroups[selectedSubject] || [];

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{competition.competition_name}</h2>
            <p className="text-sm text-slate-400 mt-1">Competition Leaderboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No participants yet</p>
            </div>
          ) : (
            <>
              {/* Subject Tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedSubject === subject
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              {/* Leaderboard Table */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Study Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Sessions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {currentSubjectData.map((entry, index) => (
                      <tr key={entry.user_id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getRankIcon(index + 1)}
                            <span className="text-white font-semibold">#{index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {entry.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-white font-medium">{entry.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-400 font-semibold">{formatTime(entry.total_time || 0)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-slate-300">{entry.session_count || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            Period: {new Date(competition.start_time).toLocaleDateString()} - {new Date(competition.end_time).toLocaleDateString()}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
