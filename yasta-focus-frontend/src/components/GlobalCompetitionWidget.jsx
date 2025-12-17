import React, { useState, useMemo } from 'react';
import { Plus, Globe, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import CompetitionInfoModal from './CompetitionInfoModal';
import CompetitionJoinModal from './CompetitionJoinModal';
import CreateGlobalCompetitionModal from './CreateGlobalCompetitionModal';

import { useGetCompetitions } from '../services/communityServices/hooks/useGetCompetitions';
import { useJoinCompetition } from '../services/communityServices/hooks/useJoinCompetition';
import { useDeleteGlobalCompetition } from '../services/communityServices/hooks/useDeleteGlobalCompetition';
import { useGetSubjects } from '../services/subjectServices/hooks/useGetSubjects';
import { useUser } from '../services/authServices';

export default function GlobalCompetitionWidget({ isAdmin }) {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompetitionInfo, setShowCompetitionInfo] = useState(false);
  const [showCompetitionJoin, setShowCompetitionJoin] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const { data: userData } = useUser();
  const currentUser = userData?.data?.user || userData?.user || userData;
  
  const { data: competitionsData, isLoading, isError } = useGetCompetitions();
  
  // Filter global competitions
  const globalCompetitions = useMemo(() => {
    if (!competitionsData) return [];
    const filtered = competitionsData.filter(comp => comp.competition_type === 'global');
    // Remove duplicates by competition_id
    const seen = new Set();
    return filtered.filter(comp => {
      const duplicate = seen.has(comp.competition_id);
      seen.add(comp.competition_id);
      return !duplicate;
    });
  }, [competitionsData]);
  
  const { mutateAsync: joinCompetitionAsync } = useJoinCompetition();
  const { mutateAsync: deleteCompetitionAsync } = useDeleteGlobalCompetition();
  const { data: subjectsData } = useGetSubjects();
  const subjects = subjectsData?.data?.subjects || [];

  const handleInfoCompetition = (competition) => {
    setSelectedCompetition(competition);
    setShowCompetitionInfo(true);
  };
  
  const handleJoinCompetition = (competition) => {
    setSelectedCompetition(competition);
    setShowCompetitionJoin(true);
  };

  const handleViewLeaderboard = (competition) => {
    navigate(`/competitions/${competition.competition_id}/leaderboard`);
  };

  const handleDeleteCompetition = async (competitionId) => {
    if (window.confirm('Are you sure you want to delete this global competition? This action cannot be undone.')) {
      try {
        await deleteCompetitionAsync(competitionId);
      } catch (error) {
        console.error('Error deleting competition:', error);
        alert('Failed to delete competition. Please try again.');
      }
    }
  };

  const handleJoinSubmit = async ({ competitionId, subjects }) => {
    try {
      await joinCompetitionAsync({ competitionId, payload: { subjects } });
      setShowCompetitionJoin(false);
    } catch (error) {
      console.error("Error joining competition:", error.response?.data || error.message);
    }
  };

  return (
    <>
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-lg text-white">Global Competitions</h3>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus size={16} />
              New
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {isLoading && <p className="text-slate-400">Loading competitions...</p>}
          {isError && <p className="text-red-400">Error loading competitions.</p>}
          {!isLoading && !isError && globalCompetitions.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">No global competitions yet.</p>
          )}
          {globalCompetitions.map((comp) => {
            const hasJoined = comp.entry_status === 'joined';
            const showViewButton = isAdmin || hasJoined;
            const isFull = comp.max_participants && comp.participant_count >= comp.max_participants;
            const showJoinButton = !isAdmin && !hasJoined && !isFull;
            const endDate = new Date(comp.end_time);
            const now = new Date();
            const isActive = endDate > now;
            
            return (
            <div key={comp.competition_id} className="bg-gradient-to-br from-purple-700/30 to-slate-800/50 p-5 rounded-xl border border-purple-600/30 hover:border-purple-500/50 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-base mb-1">{comp.competition_name}</h4>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-600/20 border border-slate-500/30 rounded-full text-slate-400 text-xs font-medium">
                        Ended
                      </span>
                    )}
                    {isFull && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
                        Full
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteCompetition(comp.competition_id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete competition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <p className="text-sm text-slate-300 mb-3 line-clamp-2">{comp.comp_description}</p>
              
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                <span>📅 Ends: {endDate.toLocaleDateString()}</span>
                {comp.participant_count !== undefined && (
                  <span>👥 {comp.participant_count} participants</span>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => handleInfoCompetition(comp)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-600/80 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105"
                >
                  Info
                </button>
                {showViewButton && (
                  <button
                    onClick={() => handleViewLeaderboard(comp)}
                    className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                  >
                    View Leaderboard
                  </button>
                )}
                {showJoinButton && (
                  <button
                    onClick={() => handleJoinCompetition(comp)}
                    className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                  >
                    Join Now
                  </button>
                )}
                {isFull && !hasJoined && !isAdmin && (
                  <button
                    disabled
                    className="px-4 py-2 text-xs font-semibold bg-slate-600/50 text-slate-400 rounded-lg cursor-not-allowed"
                  >
                    Full
                  </button>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Modals */}
      {isAdmin && (
        <CreateGlobalCompetitionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      <CompetitionInfoModal
        competition={selectedCompetition}
        isOpen={showCompetitionInfo}
        onClose={() => {
          setShowCompetitionInfo(false);
          setSelectedCompetition(null);
        }}
        isManager={isAdmin}
        isGlobal={true}
      />
      <CompetitionJoinModal
        competition={selectedCompetition}
        isOpen={showCompetitionJoin}
        onClose={() => {
          setShowCompetitionJoin(false);
          setSelectedCompetition(null);
        }}
        onSubmit={handleJoinSubmit}
        subjects={subjects}
      />
    </>
  );
}
