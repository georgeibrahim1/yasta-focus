import React, { useState } from 'react'
import EventsPanel from './EventsPanel'
import EventInfoModal from './EventInfoModal'
import CompetitionInfoModal from './CompetitionInfoModal'
import CompetitionJoinModal from './CompetitionJoinModal'
import CreateCommunityModal from './CreateCommunityModal'
import ProtectedComponent from './ProtectedComponent'
import { useUser } from '../services/authServices'
import { useGetSubjects } from '../services/subjectServices/hooks/useGetSubjects'
import { useJoinCompetition } from '../services/communityServices/hooks/useJoinCompetition'
import { useCreateCommunity } from '../services/communityServices/hooks/useCreateCommunity'

export default function CommunitySidebar() {
  const { data: userData } = useUser()
  const user = userData?.data?.user
  const isAdmin = user?.role === 0

  const [showEventInfo, setShowEventInfo] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showCompetitionInfo, setShowCompetitionInfo] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [showCompetitionJoin, setShowCompetitionJoin] = useState(false)
  const [showCreateCommunity, setShowCreateCommunity] = useState(false)

  const { data: subjectsData } = useGetSubjects()
  const subjects = subjectsData?.data?.subjects || []
  const { mutateAsync: joinCompetitionAsync } = useJoinCompetition()
  const { mutateAsync: createCommunityAsync } = useCreateCommunity()

  const handleJoinEvent = (event) => {
    // TODO: Implement join event functionality
    console.log('Join event:', event.id)
  }

  const handleInfoEvent = (event) => {
    setSelectedEvent(event)
    setShowEventInfo(true)
  }

  const handleJoinCompetition = (competition) => {
    setSelectedCompetition(competition)
    setShowCompetitionJoin(true)
  }

  const handleViewCompetition = (competition) => {
    // TODO: Navigate to competition detail page
    console.log('View competition:', competition.competition_id)
  }

  const handleInfoCompetition = (competition) => {
    setSelectedCompetition(competition)
    setShowCompetitionInfo(true)
  }

  const handleCompetitionSubmit = async ({ competitionId, payload }) => {
    await joinCompetitionAsync({ competitionId, payload })
    setShowCompetitionJoin(false)
  }

  const handleCreateCommunity = async (formData) => {
    await createCommunityAsync(formData)
    setShowCreateCommunity(false)
  }

  return (
    <>
      <div className="w-80 h-screen sticky top-0 overflow-y-auto p-6 bg-slate-900/30 border-l border-slate-700/50">
        <div className="space-y-6">
          <EventsPanel
            onJoinEvent={handleJoinEvent}
            onInfoEvent={handleInfoEvent}
            onJoinCompetition={handleJoinCompetition}
            onViewCompetition={handleViewCompetition}
            onInfoCompetition={handleInfoCompetition}
            isAdmin={isAdmin}
          />

          {/* Create Community Button - Protected by XP >= 400 */}
          <ProtectedComponent
            fallback={
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <p className="text-slate-400 text-sm text-center mb-3">
                  Earn 400 XP to create communities
                </p>
                <div className="w-full py-3 px-6 bg-slate-700/50 text-slate-500 rounded-xl text-center font-semibold cursor-not-allowed">
                  Create Community
                </div>
              </div>
            }
          >
            {user && user.xp >= 400 ? (
              <button
                onClick={() => setShowCreateCommunity(true)}
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors shadow-lg"
              >
                Create New Community
              </button>
            ) : (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <p className="text-slate-400 text-sm text-center mb-3">
                  Earn {400 - (user?.xp || 0)} more XP to create communities
                </p>
                <div className="w-full py-3 px-6 bg-slate-700/50 text-slate-500 rounded-xl text-center font-semibold cursor-not-allowed">
                  Create Community
                </div>
              </div>
            )}
          </ProtectedComponent>
        </div>
      </div>

      {/* Modals */}
      <EventInfoModal
        event={selectedEvent}
        isOpen={showEventInfo}
        onClose={() => {
          setShowEventInfo(false)
          setSelectedEvent(null)
        }}
      />

      <CompetitionInfoModal
        competition={selectedCompetition}
        isOpen={showCompetitionInfo}
        onClose={() => {
          setShowCompetitionInfo(false)
          setSelectedCompetition(null)
        }}
      />

      <CompetitionJoinModal
        competition={selectedCompetition}
        isOpen={showCompetitionJoin}
        onClose={() => {
          setShowCompetitionJoin(false)
          setSelectedCompetition(null)
        }}
        onSubmit={handleCompetitionSubmit}
        subjects={subjects}
      />

      <CreateCommunityModal
        isOpen={showCreateCommunity}
        onClose={() => setShowCreateCommunity(false)}
        onSubmit={handleCreateCommunity}
      />
    </>
  )
}
