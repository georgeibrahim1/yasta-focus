import React, { useState, useMemo } from 'react'
import Input from '../components/Input'
import Select from '../components/Select'
import CommunityCard from '../components/CommunityCard'
import CommunitySidebar from '../components/CommunitySidebar'
import { useGetCommunities } from '../services/communityServices/hooks/useGetCommunities'
import { useGetAllTags } from '../services/communityServices/hooks/useGetAllTags'
import { useJoinCommunity } from '../services/communityServices/hooks/useJoinCommunity'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CommunitiesPage() {
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('') // Single tag selection
  const [sizeFilter, setSizeFilter] = useState('all') // all, small (1-10), medium (11-50), large (51+)
  const [showJoined, setShowJoined] = useState('all') // all, joined, not-joined
  const [page, setPage] = useState(1)
  const limit = 6

  // Build params object for API
  const params = useMemo(() => {
    const p = { page, limit }
    if (search) p.search = search
    if (selectedTag) p.tags = selectedTag
    if (sizeFilter === 'small') {
      p.sizeMin = 1
      p.sizeMax = 10
    } else if (sizeFilter === 'medium') {
      p.sizeMin = 11
      p.sizeMax = 50
    } else if (sizeFilter === 'large') {
      p.sizeMin = 51
    }
    if (showJoined !== 'all') p.showJoined = showJoined
    return p
  }, [search, selectedTag, sizeFilter, showJoined, page])

  const { data: communitiesData, isLoading } = useGetCommunities(params)
  const { data: tagsData } = useGetAllTags()
  const { mutate: joinCommunity } = useJoinCommunity()

  const communities = communitiesData?.data?.communities || []
  const totalPages = communitiesData?.data?.totalPages || 1
  const allTags = tagsData?.data?.tags || []

  const handleJoinClick = (communityId) => {
    joinCommunity(communityId)
  }

  const handleViewClick = (communityId) => {
    // TODO: Navigate to community detail page
    console.log('View community:', communityId)
  }

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-extrabold text-white mb-6">Communities</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          placeholder="Search communities..."
          value={search}
          label=""
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* Filters Row */}
      <div className="flex gap-4 mb-6 flex-wrap items-end">
        {/* Show Joined Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoined('all'); setPage(1) }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showJoined === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setShowJoined('joined'); setPage(1) }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showJoined === 'joined' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Joined
          </button>
          <button
            onClick={() => { setShowJoined('not-joined'); setPage(1) }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showJoined === 'not-joined' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Not Joined
          </button>
        </div>

        {/* Tags Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select
            label=""
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value)
              setPage(1)
            }}
            options={[
              { value: '', label: 'All Tags' },
              ...allTags.map((tagObj) => ({
                value: tagObj.tag,
                label: `${tagObj.tag} (${tagObj.count})`
              }))
            ]}
          />
        </div>

        {/* Size Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select
            label=""
            value={sizeFilter}
            onChange={(e) => {
              setSizeFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All Sizes' },
              { value: 'small', label: 'Small (1-10)' },
              { value: 'medium', label: 'Medium (11-50)' },
              { value: 'large', label: 'Large (51+)' }
            ]}
          />
        </div>
      </div>

      {/* Communities Grid */}
      {isLoading ? (
        <div className="text-slate-400 text-center py-12">Loading communities...</div>
      ) : communities.length === 0 ? (
        <div className="text-slate-400 text-center py-12">No communities found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {communities.map((community) => (
              <CommunityCard
                key={community.community_id}
                community={community}
                onJoin={() => handleJoinClick(community.community_id)}
                onView={() => handleViewClick(community.community_id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-slate-300">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
      </div>
      
      {/* Right Sidebar */}
      <CommunitySidebar />
    </div>
  )
}
