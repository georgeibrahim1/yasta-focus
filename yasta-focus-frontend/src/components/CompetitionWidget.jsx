import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';

import CompetitionInfoModal from './CompetitionInfoModal';
import CompetitionJoinModal from './CompetitionJoinModal';
import CreateCompetitionModal from './CreateCompetitionModal';

import { useGetCommunityCompetitions } from '../services/communityServices/hooks/useGetCommunityCompetitions';
import { useCreateCommunityCompetition } from '../services/communityServices/hooks/useCreateCommunityCompetition';
import { useJoinCommunityCompetition } from '../services/communityServices/hooks/useJoinCommunityCompetition';
import { useDeleteCommunityCompetition } from '../services/communityServices/hooks/useDeleteCommunityCompetition';
import { useGetSubjects } from '../services/subjectServices/hooks/useGetSubjects';
import { useCommunityMembers } from '../services/communityServices/hooks/useCommunityMembers';
import { useUser } from '../services/authServices';

export default function CompetitionWidget({ communityId, isAdmin }) {
  const navigate = useNavigate();
  const [showCreateInfo, setShowCreateInfo] = useState(false);
  const [showCompetitionInfo, setShowCompetitionInfo] = useState(false);
  const [showCompetitionJoin, setShowCompetitionJoin] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const { data: userData } = useUser();
  const currentUser = userData?.data?.user || userData?.user || userData;
  const { data: membersData } = useCommunityMembers(communityId);
  const isManager = membersData?.data?.currentUserIsManager || isAdmin;
  
  const { data: competitionsData, isLoading, isError } = useGetCommunityCompetitions(communityId);
  
  const uniqueCompetitions = useMemo(() => {
    if (!competitionsData) return [];
    const seen = new Set();
    return competitionsData.filter(comp => {
      const duplicate = seen.has(comp.competition_id);
      seen.add(comp.competition_id);
      return !duplicate;
    });
  }, [competitionsData]);
  
  const { mutateAsync: createCompetitionAsync } = useCreateCommunityCompetition(communityId);
  const { mutateAsync: joinCompetitionAsync } = useJoinCommunityCompetition(communityId);
  const { mutateAsync: deleteCompetitionAsync } = useDeleteCommunityCompetition();
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
    navigate(`/communities/${communityId}/competitions/${competition.competition_id}/leaderboard`);
  };

  const handleDeleteCompetition = async (competitionId) => {
    if (window.confirm('Are you sure you want to delete this competition? This action cannot be undone.')) {
      try {
        await deleteCompetitionAsync({ communityId, competitionId });
      } catch (error) {
        console.error('Error deleting competition:', error);
        alert('Failed to delete competition. Please try again.');
      }
    }
  };

  const handleCreateSubmit = async (formData) => {
    await createCompetitionAsync(formData);
    setShowCreateInfo(false);
  };

  const handleJoinSubmit = async ({ competitionId, subjects }) => {
    try {
      await joinCompetitionAsync({ competitionId, payload: { subjects } });
      setShowCompetitionJoin(false);
    } catch (error) {
      console.error("Error joining competition:", error.response?.data || error.message);
      // You might want to show a toast or alert to the user here as well
    }
  };

  return (
    <>
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">Competitions</h3>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateInfo(true)}
              className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg transition"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-slate-400 text-xs">Loading...</div>
        ) : isError ? (
          <div className="text-red-400 text-xs">Error loading competitions</div>
        ) : uniqueCompetitions.length > 0 ? (
          uniqueCompetitions.map((comp) => {
            const hasJoined = comp.entry_status === 'joined';
            const showViewButton = isManager || hasJoined;
            const isFull = comp.max_participants && comp.participant_count >= comp.max_participants;
            const showJoinButton = !isManager && !hasJoined && !isFull;
            const endDate = new Date(comp.end_time);
            const now = new Date();
            const isActive = endDate > now;
            
            return (
            <div key={comp.competition_id} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium text-sm">{comp.competition_name}</div>
                  <div className="text-slate-400 text-xs">
                    {endDate.toLocaleDateString()}
                    {isFull && <span className="ml-2 text-red-400">● Full</span>}
                    {comp.participant_count !== undefined && (
                      <span className="ml-2">👥 {comp.participant_count}</span>
                    )}
                  </div>
                </div>
                {isManager && (
                  <button
                    onClick={() => handleDeleteCompetition(comp.competition_id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                    title="Delete competition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleInfoCompetition(comp)}
                  className="flex-1 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-xs hover:bg-slate-600 transition"
                >
                  Info
                </button>
                {showViewButton && (
                  <button
                    onClick={() => handleViewLeaderboard(comp)}
                    className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-500 transition"
                  >
                    Leaderboard
                  </button>
                )}
                {showJoinButton && (
                  <button
                    onClick={() => handleJoinCompetition(comp)}
                    className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-500 transition"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          );
          })
        ) : (
          <div className="text-slate-400 text-xs">No competitions yet</div>
        )}
      </div>

      {/* Modals */}
      <CreateCompetitionModal
        isOpen={showCreateInfo}
        onClose={() => setShowCreateInfo(false)}
        onSubmit={handleCreateSubmit}
        communityId={communityId}
      />
      <CompetitionInfoModal
        competition={selectedCompetition}
        isOpen={showCompetitionInfo}
        onClose={() => {
          setShowCompetitionInfo(false);
          setSelectedCompetition(null);
        }}
        communityId={communityId}
        isManager={isManager}
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