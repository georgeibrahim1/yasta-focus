import React, { useState, useMemo } from 'react'
import CommunityCard from '../components/CommunityCard'
import EventsPanel from '../components/EventsPanel'
import JoinRequestModal from '../components/JoinRequestModal'
import CompetitionJoinModal from '../components/CompetitionJoinModal'
import CreateCommunityButton from '../components/CreateCommunityButton'
import Input from '../components/Input'
import { useGetCommunities } from '../services/communityServices/hooks/useGetCommunities'
import { useGetJoinedCommunities } from '../services/communityServices/hooks/useGetJoinedCommunities'
import { useGetSubjects } from '../services/subjectServices/hooks/useGetSubjects'
import { useJoinCompetition } from '../services/communityServices/hooks/useJoinCompetition'

export default function CommunitiesPage() {
  const [search, setSearch] = useState('')
  const [selectedCommunityToJoin, setSelectedCommunityToJoin] = useState(null)
  const [selectedCompetitionToJoin, setSelectedCompetitionToJoin] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: communities = [], isLoading: loadingAll } = useGetCommunities(search)
  const { data: joined = [], isLoading: loadingJoined } = useGetJoinedCommunities()
  const { data: subjectsData } = useGetSubjects()
  const subjects = useMemo(() => subjectsData?.data?.subjects || [], [subjectsData])

  // When search is empty, put joined communities first
  const sorted = useMemo(() => {
    if (!search) {
      const joinedIds = new Set((joined || []).map(c => c.id))
      const joinedList = (joined || []).map(c => ({ ...c, joined: true }))
      const others = (communities || []).filter(c => !joinedIds.has(c.id))
      return [...joinedList, ...others]
    }
    return communities
  }, [search, communities, joined])

  const handleJoinClick = (community) => {
    setSelectedCommunityToJoin(community)
  }

  const handleViewClick = (community) => {
    // TODO: Navigate to community detail page
    console.log('View community:', community.id)
  }

  const handleCreateClick = () => {
    // TODO: Open create community modal
    console.log('Create community')
  }

  // competition join mutation
  const { mutateAsync: joinCompetitionMutateAsync, isLoading: joiningCompetition } = useJoinCompetition()

  const handleCompetitionSubmit = async ({ competitionId, payload }) => {
    console.log('[CommunitiesPage] submitting join for', competitionId, payload)
    // use mutateAsync so we can await the server call if needed
    await joinCompetitionMutateAsync({ competitionId, payload })
  }

  return (
    <>
      <div className="p-6 grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <h1 className="text-3xl font-extrabold text-white mb-6">Explore Communities</h1>

          <div className="mb-6">
            <Input
              placeholder="Search communities, events, or topics..."
              value={search}
              label=""
              onChange={(e) => setSearch(e.target.value)}
              inputClassName="max-w-2xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {loadingAll ? (
              <div className="col-span-3 text-slate-400 text-center py-12">
                Loading communities...
              </div>
            ) : sorted.length === 0 ? (
              <div className="col-span-3 text-slate-400 text-center py-12">
                No communities found
              </div>
            ) : (
              sorted.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onJoin={() => handleJoinClick(community)}
                  onView={() => handleViewClick(community)}
                />
              ))
            )}
          </div>
        </div>

        <div className="col-span-4">
          <EventsPanel 
            onAddEvent={() => console.log('Add event')}
            onJoinCompetition={(comp) => setSelectedCompetitionToJoin(comp)}
            onViewCompetition={() => { /* noop: view not implemented yet */ }}
          />
        </div>
      </div>

      <CreateCommunityButton onClick={handleCreateClick} />

      <JoinRequestModal
        community={selectedCommunityToJoin}
        isOpen={!!selectedCommunityToJoin}
        onClose={() => setSelectedCommunityToJoin(null)}
      />

      <CompetitionJoinModal
        competition={selectedCompetitionToJoin}
        isOpen={!!selectedCompetitionToJoin}
        onClose={() => setSelectedCompetitionToJoin(null)}
        onSubmit={async ({ competitionId, payload }) => {
          await handleCompetitionSubmit({ competitionId, payload })
          setSelectedCompetitionToJoin(null)
        }}
        subjects={subjects}
      />
    </>
  )
}
