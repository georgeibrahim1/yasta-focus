import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';

import CompetitionInfoModal from './CompetitionInfoModal';
import CompetitionJoinModal from './CompetitionJoinModal';
import CreateCompetitionModal from './CreateCompetitionModal';

import { useGetCommunityCompetitions } from '../services/communityServices/hooks/useGetCommunityCompetitions';
import { useCreateCommunityCompetition } from '../services/communityServices/hooks/useCreateCommunityCompetition';
import { useJoinCommunityCompetition } from '../services/communityServices/hooks/useJoinCommunityCompetition';
import { useGetSubjects } from '../services/subjectServices/hooks/useGetSubjects';

export default function CompetitionWidget({ communityId, isAdmin }) {
  const [showCreateInfo, setShowCreateInfo] = useState(false);
  const [showCompetitionInfo, setShowCompetitionInfo] = useState(false);
  const [showCompetitionJoin, setShowCompetitionJoin] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

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
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-white">Competitions</h3>
          {isAdmin && (
            <button
              onClick={() => setShowCreateInfo(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus size={16} />
              New
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {isLoading && <p className="text-slate-400">Loading competitions...</p>}
          {isError && <p className="text-red-400">Error loading competitions.</p>}
          {!isLoading && !isError && uniqueCompetitions.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">No competitions yet.</p>
          )}
          {uniqueCompetitions.map((comp) => (
            <div key={comp.competition_id} className="bg-slate-700/50 p-4 rounded-lg">
              <h4 className="font-semibold text-white truncate">{comp.competition_name}</h4>
              <p className="text-sm text-slate-300 mb-3 truncate">{comp.comp_description}</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => handleInfoCompetition(comp)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors"
                >
                  Info
                </button>
                <button
                  onClick={() => handleJoinCompetition(comp)}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-md transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
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