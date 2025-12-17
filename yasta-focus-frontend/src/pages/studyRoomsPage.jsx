import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Users, ArrowLeft, Plus, Trash2, UserPlus, Flag, UserX, Megaphone, Shield, Edit3, Clock, Check, X, Settings, LogOut, BarChart3, TrendingUp } from 'lucide-react'
import { useStudyRooms, useJoinRoom, useLeaveRoom, useDeleteRoom } from '../services/studyRoomServices'
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../services/announcementServices'
import { useCommunityMembers, useKickMember, usePendingRequests, useApproveJoinRequest, useRejectJoinRequest, useCommunityStats, usePromoteMember, useDemoteMember, useAddMemberByUsername, useInviteFriendToCommunity, useCreateCommunityCompetition, useJoinCommunityCompetition, useDeleteCommunityCompetition } from '../services/communityServices'
import { useUpdateCommunityInfo, useDeleteCommunity, useExitCommunity, useUpdateMemberBio } from '../services/communityServices'
import { useSendFriendRequest, useReportUser } from '../services/leaderboardServices'
import { useGetFriends } from '../services/friendshipServices'
import { useUser } from '../services/authServices'
import Select from '../components/Select'
import CreateRoomModal from '../components/CreateRoomModal'
import ReportModal from '../components/ReportModal'
import ProtectedComponent from '../components/ProtectedComponent'
import CompetitionWidget from '../components/CompetitionWidget'

export default function StudyRoomsPage() {
  const { communityId } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false)
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showBioModal, setShowBioModal] = useState(false)
  const [newBio, setNewBio] = useState('')
  const [showCommunityEditModal, setShowCommunityEditModal] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [communityDescription, setCommunityDescription] = useState('')
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [joiningRoomCode, setJoiningRoomCode] = useState(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showInviteFriendModal, setShowInviteFriendModal] = useState(false)
  const [addMemberUsername, setAddMemberUsername] = useState('')
  const [selectedFriendToInvite, setSelectedFriendToInvite] = useState(null)
  const [addMemberError, setAddMemberError] = useState('')
  const [inviteFriendError, setInviteFriendError] = useState('')
  const [showCreateCompetitionModal, setShowCreateCompetitionModal] = useState(false)
  const [showJoinCompetitionModal, setShowJoinCompetitionModal] = useState(false)
  const [competitionName, setCompetitionName] = useState('')
  const [competitionDescription, setCompetitionDescription] = useState('')
  const [competitionDeadline, setCompetitionDeadline] = useState('')
  const [maxSubjects, setMaxSubjects] = useState(3)
  const [maxParticipants, setMaxParticipants] = useState(20)
  const [selectedCompetition, setSelectedCompetition] = useState(null)
  const [selectedSubjects, setSelectedSubjects] = useState([])

  const { data: currentUser } = useUser()
  const { data: rooms = [], isLoading } = useStudyRooms(communityId, search)
  const { data: announcements = [] } = useAnnouncements(communityId)
  const { data: membersData } = useCommunityMembers(communityId)
  const joinRoom = useJoinRoom()
  const leaveRoom = useLeaveRoom()
  const deleteRoom = useDeleteRoom()
  const kickMember = useKickMember()
  const promoteMember = usePromoteMember()
  const demoteMember = useDemoteMember()
  const { mutate: sendFriendRequest } = useSendFriendRequest()
  const { mutate: reportUser } = useReportUser()
  const createAnnouncement = useCreateAnnouncement()
  const approveRequest = useApproveJoinRequest()
  const rejectRequest = useRejectJoinRequest()
  const updateBio = useUpdateMemberBio()
  const updateCommunityInfo = useUpdateCommunityInfo()
  const deleteCommunity = useDeleteCommunity()
  const exitCommunity = useExitCommunity()
  const deleteAnnouncementMutation = useDeleteAnnouncement()
  const createCompetitionMutation = useCreateCommunityCompetition()
  const joinCompetitionMutation = useJoinCommunityCompetition()
  const deleteCompetitionMutation = useDeleteCommunityCompetition()
  const addMemberMutation = useAddMemberByUsername()
  const inviteFriendMutation = useInviteFriendToCommunity()
  
  const { data: stats } = useCommunityStats(communityId)
  const { data: friendsList = [] } = useGetFriends()

  const user = currentUser?.data?.user || currentUser?.user || currentUser
  const userId = user?.user_id
  const userXp = user?.xp || 0

  const community = membersData?.community || {}
  const members = membersData?.members || []
  const currentUserIsManager = membersData?.currentUserIsManager || false
  const currentUserMember = members.find(m => m.user_id === userId)

  // Fetch pending requests only if user is manager
  const { data: pendingMembers = [] } = usePendingRequests(communityId, currentUserIsManager)

  // Find which room the user is currently a member of
  const userCurrentRoom = rooms.find(room => 
    room.members?.some(member => member.user_id === userId)
  )

  // Helper function to check if user can enter a room
  const canEnterRoom = (targetRoomCode) => {
    // Managers can enter any room
    if (currentUserIsManager) return true
    if (!userCurrentRoom) return true
    return userCurrentRoom.room_code === targetRoomCode
  }

  // Filter rooms by size
  const filteredRooms = rooms.filter(room => {
    const memberCount = room.members?.length || 0
    if (sizeFilter === 'small') return memberCount >= 1 && memberCount <= 5
    if (sizeFilter === 'medium') return memberCount >= 6 && memberCount <= 15
    if (sizeFilter === 'large') return memberCount > 15
    return true
  })

  const handleJoinRoom = async (roomCode) => {
    // Skip multi-room check for managers
    if (!currentUserIsManager) {
      const activeRoom = localStorage.getItem('activeRoom')
      if (activeRoom) {
        const parsed = JSON.parse(activeRoom)
        if (!window.confirm(`You're currently in another room (${parsed.roomName}). Leave that room first to join this one.`)) {
          return
        }
      }
    }
    
    setJoiningRoomCode(roomCode)
    try {
      await joinRoom.mutateAsync(roomCode)
    } catch {
      // Error handled by mutation
    } finally {
      setJoiningRoomCode(null)
    }
  }

  const handleJoinByCode = async () => {
    if (!roomCodeInput.trim()) return
    
    const roomCodeNum = parseInt(roomCodeInput)
    
    try {
      await handleJoinRoom(roomCodeNum)
      // Close modal and navigate only if join was successful
      const roomExists = rooms.find(r => r.room_code === roomCodeNum)
      if (roomExists) {
        setShowJoinByCodeModal(false)
        setRoomCodeInput('')
        navigate(`/communities/${communityId}/rooms/${roomCodeNum}`)
      } else {
        // Room might not be in the list, try navigating anyway
        setShowJoinByCodeModal(false)
        setRoomCodeInput('')
        navigate(`/communities/${communityId}/rooms/${roomCodeNum}`)
      }
    } catch {
      // Error handled by mutation
    }
  }

  const handleLeaveRoom = async (roomCode) => {
    try {
      await leaveRoom.mutateAsync(roomCode)
    } catch {
      // Error handled by mutation
    }
  }

  const handleDeleteRoom = async (roomCode) => {
    if (window.confirm('Are you sure you want to delete this study room?')) {
      try {
        await deleteRoom.mutateAsync(roomCode)
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleKickMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member from the community?')) {
      try {
        await kickMember.mutateAsync({ communityId, memberId })
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handlePromoteMember = async (memberId) => {
    if (window.confirm('Promote this member to community manager?')) {
      try {
        await promoteMember.mutateAsync({ communityId, memberId })
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleDemoteMember = async (memberId) => {
    if (window.confirm('Demote this manager to a regular member?')) {
      try {
        await demoteMember.mutateAsync({ communityId, memberId })
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleFriendRequest = async (member) => {
    await sendFriendRequest(member.user_id)
  }

  const handleReport = (member) => {
    setSelectedUser(member)
    setShowReportModal(true)
  }

  const handleReportSubmit = async ({ userId: reportedUserId, title, description }) => {
    reportUser({ userId: reportedUserId, title, description })
  }

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.trim()) return
    try {
      await createAnnouncement.mutateAsync({
        communityId,
        announcementData: { content: newAnnouncement }
      })
      setNewAnnouncement('')
      setShowAnnouncementForm(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleEditCommunity = () => {
    setCommunityName(community.community_name || '')
    setCommunityDescription(community.community_description || '')
    setShowCommunityEditModal(true)
  }

  const handleSaveCommunityInfo = async () => {
    try {
      await updateCommunityInfo.mutateAsync({
        communityId,
        communityData: {
          community_Name: communityName,
          community_Description: communityDescription
        }
      })
      setShowCommunityEditModal(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleDeleteCommunity = async () => {
    if (window.confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      try {
        await deleteCommunity.mutateAsync(communityId)
        navigate('/communities')
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleExitCommunity = async () => {
    if (window.confirm('Are you sure you want to leave this community?')) {
      try {
        await exitCommunity.mutateAsync(communityId)
        navigate('/communities')
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleCreateCompetition = async () => {
    if (!competitionName.trim() || !competitionDeadline) return
    try {
      await createCompetitionMutation.mutateAsync({
        communityId,
        competitionData: {
          title: competitionName,
          description: competitionDescription,
          end_time: competitionDeadline,
          max_subjects: maxSubjects,
          max_participants: maxParticipants
        }
      })
      setCompetitionName('')
      setCompetitionDescription('')
      setCompetitionDeadline('')
      setMaxSubjects(3)
      setMaxParticipants(20)
      setShowCreateCompetitionModal(false)
    } catch {
      // Error handled by mutation
    }
  }

  const handleOpenJoinCompetition = (competition) => {
    setSelectedCompetition(competition)
    setSelectedSubjects([])
    setShowJoinCompetitionModal(true)
  }

  const handleJoinCompetition = async () => {
    if (selectedSubjects.length === 0) return
    try {
      await joinCompetitionMutation.mutateAsync({
        communityId,
        competitionId: selectedCompetition.competition_id,
        subjects: selectedSubjects
      })
      setShowJoinCompetitionModal(false)
      setSelectedCompetition(null)
      setSelectedSubjects([])
    } catch {
      // Error handled by mutation
    }
  }

  const handleDeleteCompetition = async (competitionId) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      try {
        await deleteCompetitionMutation.mutateAsync({ communityId, competitionId })
      } catch {
        // Error handled by mutation
      }
    }
  }



  const handleAddMember = async () => {
    if (!addMemberUsername.trim()) {
      setAddMemberError('Please enter a username')
      return
    }
    setAddMemberError('')
    try {
      await addMemberMutation.mutateAsync({ communityId, username: addMemberUsername.trim() })
      setAddMemberUsername('')
      setShowAddMemberModal(false)
    } catch (error) {
      setAddMemberError(error.response?.data?.message || 'Failed to add member')
    }
  }

  const handleInviteFriend = async () => {
    if (!selectedFriendToInvite) {
      setInviteFriendError('Please select a friend')
      return
    }
    setInviteFriendError('')
    try {
      await inviteFriendMutation.mutateAsync({ communityId, friendId: selectedFriendToInvite })
      setSelectedFriendToInvite(null)
      setShowInviteFriendModal(false)
    } catch (error) {
      setInviteFriendError(error.response?.data?.message || 'Failed to invite friend')
    }
  }

  const isRoomMember = (room) => {
    return room.members?.some(member => member.user_id === userId)
  }

  const isRoomCreator = (room) => {
    return room.student_creator === userId
  }

  const canCreateRoom = userXp >= 100

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => navigate('/communities')}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white">
                  {community.community_name || 'Study Rooms'}
                </h1>
                {currentUserIsManager && (
                  <>
                    <button
                      onClick={handleEditCommunity}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit community info"
                    >
                      <Settings size={18} className="text-slate-400 hover:text-indigo-400" />
                    </button>
                    <button
                      onClick={() => setShowStatsModal(true)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="View statistics"
                    >
                      <TrendingUp size={18} className="text-slate-400 hover:text-green-400" />
                    </button>
                  </>
                )}
                {currentUserIsManager ? (
                  <button
                    onClick={handleDeleteCommunity}
                    className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete community"
                  >
                    <Trash2 size={18} className="text-slate-400 hover:text-red-500" />
                  </button>
                ) : (
                  <button
                    onClick={handleExitCommunity}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Leave community"
                  >
                    <LogOut size={18} className="text-slate-400 hover:text-orange-400" />
                  </button>
                )}
              </div>
              {community.community_description && (
                <p className="text-slate-400 mt-1">{community.community_description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by room name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          {/* Size Filter */}
          <div className="w-48">
            <Select
              label=""
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Sizes' },
                { value: 'small', label: 'Small (1-5)' },
                { value: 'medium', label: 'Medium (6-15)' },
                { value: 'large', label: 'Large (15+)' }
              ]}
            />
          </div>

          {/* Join by Code Button */}
          <button
            onClick={() => setShowJoinByCodeModal(true)}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Join by Code
          </button>

          <div className="flex-1" />
        </div>

        {/* Study Rooms List */}
        {isLoading ? (
          <div className="text-slate-400 text-center py-12">Loading study rooms...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-slate-400 text-center py-12">
            {search ? 'No rooms found matching your search' : 'No study rooms yet. Create the first one!'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <div
                key={room.room_code}
                className="bg-slate-800/30 border border-dashed border-indigo-500/50 rounded-2xl p-6 hover:border-indigo-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Room Name */}
                    <h3 className="text-xl font-bold text-white mb-2">{room.room_name}</h3>
                    
                    {/* Room Code Tag */}
                    <span className="inline-block px-3 py-1 bg-indigo-600/30 text-indigo-400 text-xs font-semibold rounded-full mb-3">
                      #{room.room_code}
                    </span>

                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4">
                      Created by {room.creator?.username || 'Unknown'}
                    </p>
                  </div>

                  {/* Member Avatars */}
                  <div className="flex -space-x-2">
                    {room.members?.slice(0, 3).map((member) => (
                      <div
                        key={member.user_id}
                        className="w-10 h-10 rounded-full border-2 border-slate-800 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold"
                        title={member.username}
                      >
                        {member.profile_pic ? (
                          <img src={member.profile_pic} alt={member.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          member.username?.charAt(0).toUpperCase()
                        )}
                      </div>
                    ))}
                    {room.members?.length > 3 && (
                      <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                        +{room.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  {isRoomCreator(room) ? (
                    <>
                      <button
                        onClick={() => {
                          if (!canEnterRoom(room.room_code)) {
                            if (!currentUserIsManager) {
                              alert(`You're currently a member of "${userCurrentRoom.room_name}". Please leave that room first.`)
                            }
                            return
                          }
                          navigate(`/communities/${communityId}/rooms/${room.room_code}`)
                        }}
                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium"
                      >
                        Open Room
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.room_code)}
                        disabled={deleteRoom.isPending}
                        className="p-2 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete room"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  ) : isRoomMember(room) ? (
                    <>
                      <button
                        onClick={() => {
                          if (!canEnterRoom(room.room_code)) {
                            if (!currentUserIsManager) {
                              alert(`You're currently a member of "${userCurrentRoom.room_name}". Please leave that room first.`)
                            }
                            return
                          }
                          navigate(`/communities/${communityId}/rooms/${room.room_code}`)
                        }}
                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium"
                      >
                        Open Room
                      </button>
                      <button
                        onClick={() => handleLeaveRoom(room.room_code)}
                        disabled={leaveRoom.isPending}
                        className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Leave room"
                      >
                        <LogOut size={20} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={async () => {
                        await handleJoinRoom(room.room_code)
                        // Only navigate if join was successful
                        if (!localStorage.getItem('activeRoom') || 
                            JSON.parse(localStorage.getItem('activeRoom')).roomCode === room.room_code.toString()) {
                          navigate(`/communities/${communityId}/rooms/${room.room_code}`)
                        }
                      }}
                      disabled={joiningRoomCode === room.room_code}
                      className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium"
                    >
                      {joiningRoomCode === room.room_code ? 'Joining...' : 'Join Room'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 h-screen sticky top-0 overflow-y-auto p-6 bg-slate-900/30 border-l border-slate-700/50">
        <div className="space-y-6">
          {/* User Actions */}
          <div className="flex gap-2">
            {/* Edit My Member Bio - Available to all non-admin members */}
            <ProtectedComponent requiredRole={1}>
              <button
                onClick={() => {
                  setNewBio(currentUserMember?.member_bio || '')
                  setShowBioModal(true)
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-xl transition-colors text-sm font-medium border border-indigo-600/30"
                title="Edit your bio in this community"
              >
                <Edit3 size={16} />
                Edit My Bio
              </button>
            </ProtectedComponent>
            
            {/* Pending Requests - Managers only */}
            {currentUserIsManager && (
              <button
                onClick={() => setShowPendingModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 rounded-xl transition-colors text-sm font-medium border border-amber-600/30 relative"
                title="Pending Join Requests"
              >
                <Clock size={16} />
                Pending
                {pendingMembers.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingMembers.length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Members Section */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Users size={18} />
                Members ({members.length})
              </h3>
              {/* Add/Invite Member Icon */}
              <button
                onClick={() => currentUserIsManager ? setShowAddMemberModal(true) : setShowInviteFriendModal(true)}
                className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                title={currentUserIsManager ? "Add member by username" : "Invite a friend"}
              >
                <UserPlus className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {member.profile_picture ? (
                      <img src={member.profile_picture} alt={member.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      member.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{member.username}</p>
                      {member.is_manager && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-600/20 text-amber-400 rounded-full shrink-0">
                          <Shield size={10} />
                          Manager
                        </span>
                      )}
                      {member.friendship_status === 'friends' && member.user_id !== userId && (
                        <span className="text-xs px-2 py-0.5 bg-green-600/20 text-green-400 rounded-full shrink-0">
                          Friend
                        </span>
                      )}
                      {member.user_id === userId && (
                        <span className="text-xs px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded-full shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs truncate">{member.member_bio || member.bio || 'No bio'}</p>
                  </div>
                  
                  {/* Action buttons - only show for other users */}
                  {member.user_id !== userId && (
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      {/* Add Friend */}
                      {member.friendship_status === 'none' && (
                        <button
                          onClick={() => handleFriendRequest(member)}
                          className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                          title="Send friend request"
                        >
                          <UserPlus className="w-4 h-4 text-slate-400 hover:text-indigo-400" />
                        </button>
                      )}
                      {member.friendship_status === 'pending_sent' && (
                        <div className="relative group/pending">
                          <button
                            disabled
                            className="p-1.5 rounded-lg cursor-not-allowed opacity-50"
                          >
                            <UserPlus className="w-4 h-4 text-slate-400" />
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover/pending:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Pending
                          </div>
                        </div>
                      )}
                      
                      {/* Report */}
                      <button
                        onClick={() => handleReport(member)}
                        className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Report user"
                      >
                        <Flag className="w-4 h-4 text-slate-400 hover:text-red-400" />
                      </button>
                      
                      {/* Kick (managers only, can't kick other managers) */}
                      {currentUserIsManager && !member.is_manager && (
                        <button
                          onClick={() => handleKickMember(member.user_id)}
                          disabled={kickMember.isPending}
                          className="p-1.5 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove from community"
                        >
                          <UserX className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </button>
                      )}
                      {/* Promote (managers only, promote regular members) */}
                      {currentUserIsManager && !member.is_manager && (
                        <button
                          onClick={() => handlePromoteMember(member.user_id)}
                          disabled={promoteMember.isPending}
                          className="p-1.5 hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Promote to manager"
                        >
                          <Shield className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                        </button>
                      )}

                      {/* Demote (managers only, demote other managers) */}
                      {currentUserIsManager && member.is_manager && member.user_id !== userId && (
                        <button
                          onClick={() => handleDemoteMember(member.user_id)}
                          disabled={demoteMember.isPending}
                          className="p-1.5 hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Demote manager"
                        >
                          <Shield className="w-4 h-4 text-slate-400 hover:text-yellow-400" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-2">No members yet</p>
              )}
            </div>
          </div>

          {/* Announcements Section */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Megaphone size={18} />
                Announcements
              </h3>
              {currentUserIsManager && (
                <button
                  onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                  className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Add announcement"
                >
                  <Plus className="w-4 h-4 text-indigo-400" />
                </button>
              )}
            </div>

            {/* New Announcement Form (managers only) */}
            {showAnnouncementForm && currentUserIsManager && (
              <div className="mb-4 space-y-2">
                <textarea
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Write an announcement..."
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateAnnouncement}
                    disabled={createAnnouncement.isPending || !newAnnouncement.trim()}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {createAnnouncement.isPending ? 'Posting...' : 'Post'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAnnouncementForm(false)
                      setNewAnnouncement('')
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-40 overflow-y-auto">
              {announcements.slice(0, 5).map((announcement) => (
                <div key={announcement.announcement_num} className="group flex items-start gap-2">
                  <div className="flex-1 text-sm border-l-2 border-indigo-500/50 pl-3">
                    <p className="text-slate-300 line-clamp-2">{announcement.content}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {currentUserIsManager && (
                    <button
                      onClick={() => {
                        deleteAnnouncementMutation.mutate({
                          announcementNum: announcement.announcement_num,
                          moderatorId: announcement.moderator_id,
                          communityId: announcement.community_id
                        })
                      }}
                      disabled={deleteAnnouncementMutation.isPending}
                      className="hidden group-hover:block p-1.5 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-2">No announcements</p>
              )}
            </div>
          </div>

          {/* Competitions Section */}
          <CompetitionWidget communityId={communityId} isAdmin={currentUserIsManager} />

          {/* Create Room Button - Only if XP >= 100 */}
          {canCreateRoom ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors"
            >
              Create a New Room
            </button>
          ) : (
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-sm text-center mb-2">
                Earn {100 - userXp} more XP to create rooms
              </p>
              <div className="w-full py-3 px-6 bg-slate-700/50 text-slate-500 rounded-xl text-center font-semibold cursor-not-allowed">
                Create a New Room
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          communityId={communityId}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        user={selectedUser}
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setSelectedUser(null)
        }}
        onSubmit={handleReportSubmit}
      />

      {/* Pending Requests Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-400" />
                Pending Requests
              </h2>
              <button
                onClick={() => setShowPendingModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {pendingMembers.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No pending requests</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingMembers.map((member) => (
                  <div key={member.user_id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {member.profile_picture ? (
                        <img src={member.profile_picture} alt={member.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        member.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{member.username}</p>
                      <p className="text-slate-400 text-xs">
                        Requested {new Date(member.join_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveRequest.mutate({ communityId, memberId: member.user_id })}
                        disabled={approveRequest.isPending}
                        className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => rejectRequest.mutate({ communityId, memberId: member.user_id })}
                        disabled={rejectRequest.isPending}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Member Bio Modal */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-400" />
                Edit My Bio
              </h2>
              <button
                onClick={() => setShowBioModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              This bio will be visible to other members of this community.
            </p>
            
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Write about yourself in this community..."
              className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500/50"
              maxLength={200}
            />
            <p className="text-slate-500 text-xs mt-2 text-right">{newBio.length}/200</p>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowBioModal(false)}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateBio.mutate({ communityId, bio: newBio })
                  setShowBioModal(false)
                }}
                disabled={updateBio.isPending}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors font-medium"
              >
                {updateBio.isPending ? 'Saving...' : 'Save Bio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Community Info Modal */}
      {showCommunityEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-indigo-400" />
                Edit Community Info
              </h2>
              <button
                onClick={() => setShowCommunityEditModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Community Name
                </label>
                <input
                  type="text"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  placeholder="Enter community name..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  placeholder="Describe your community..."
                  className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500/50"
                  maxLength={500}
                />
                <p className="text-slate-500 text-xs mt-2 text-right">{communityDescription.length}/500</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCommunityEditModal(false)}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCommunityInfo}
                disabled={updateCommunityInfo.isPending || !communityName.trim()}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
              >
                {updateCommunityInfo.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && currentUserIsManager && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700/50 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-green-400" />
                Community Statistics
              </h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {stats ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-indigo-400" />
                      <p className="text-slate-400 text-sm">Total Members</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <UserX size={16} className="text-orange-400" />
                      <p className="text-slate-400 text-sm">Left Members</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.leftMembers}</p>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={16} className="text-purple-400" />
                      <p className="text-slate-400 text-sm">Total Rooms</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalRooms}</p>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={16} className="text-green-400" />
                      <p className="text-slate-400 text-sm">Active Rooms</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.activeRooms}</p>
                  </div>
                </div>

                {/* Joined Per Day */}
                {stats.joinedPerDay && stats.joinedPerDay.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-green-400" />
                      Joined Per Day (Last 7 Days)
                    </h3>
                    <div className="space-y-2">
                      {stats.joinedPerDay.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                          <span className="text-indigo-400 font-semibold">{item.joined} members</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Joined Per Week */}
                {stats.joinedPerWeek && stats.joinedPerWeek.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-400" />
                      Joined Per Week (Last 4 Weeks)
                    </h3>
                    <div className="space-y-2">
                      {stats.joinedPerWeek.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">
                            Week of {new Date(item.week).toLocaleDateString()}
                          </span>
                          <span className="text-indigo-400 font-semibold">{item.joined} members</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Joined Per Month */}
                {stats.joinedPerMonth && stats.joinedPerMonth.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-purple-400" />
                      Joined Per Month (Last 6 Months)
                    </h3>
                    <div className="space-y-2">
                      {stats.joinedPerMonth.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">
                            {new Date(item.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </span>
                          <span className="text-indigo-400 font-semibold">{item.joined} members</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">Loading statistics...</p>
            )}
          </div>
        </div>
      )}

      {/* Join by Code Modal */}
      {showJoinByCodeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-indigo-400" />
                Join Room by Code
              </h2>
              <button
                onClick={() => {
                  setShowJoinByCodeModal(false)
                  setRoomCodeInput('')
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              Enter the room code to join a study room directly.
            </p>
            
            <input
              type="number"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value)}
              placeholder="Enter room code (e.g., 123456)"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinByCode()
                }
              }}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowJoinByCodeModal(false)
                  setRoomCodeInput('')
                }}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinByCode}
                disabled={!roomCodeInput.trim() || joinRoom.isPending}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
              >
                {joinRoom.isPending ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member by Username Modal (Managers only) */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-400" />
                Add Member
              </h2>
              <button
                onClick={() => {
                  setShowAddMemberModal(false)
                  setAddMemberUsername('')
                  setAddMemberError('')
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              Enter a username to add them as a member directly.
            </p>
            
            <input
              type="text"
              value={addMemberUsername}
              onChange={(e) => setAddMemberUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 mb-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddMember()
                }
              }}
            />
            {addMemberError && (
              <p className="text-red-400 text-sm mb-4">{addMemberError}</p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddMemberModal(false)
                  setAddMemberUsername('')
                  setAddMemberError('')
                }}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!addMemberUsername.trim() || addMemberMutation.isPending}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
              >
                {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friend Modal (Any member) */}
      {showInviteFriendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-400" />
                Invite Friend
              </h2>
              <button
                onClick={() => {
                  setShowInviteFriendModal(false)
                  setSelectedFriendToInvite(null)
                  setInviteFriendError('')
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              Invite a friend to join this community. They will be added to pending requests for manager approval.
            </p>
            
            {friendsList.length === 0 ? (
              <p className="text-slate-500 text-sm mb-4">You have no friends to invite.</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {friendsList.map((friend) => (
                  <button
                    key={friend.user_id}
                    onClick={() => setSelectedFriendToInvite(friend.user_id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      selectedFriendToInvite === friend.user_id
                        ? 'bg-indigo-600/20 border-indigo-500/50'
                        : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                    } border`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {friend.profile_picture ? (
                        <img src={friend.profile_picture} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        friend.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-medium">{friend.username}</p>
                      {friend.xp !== undefined && (
                        <p className="text-slate-400 text-xs">{friend.xp} XP</p>
                      )}
                    </div>
                    {selectedFriendToInvite === friend.user_id && (
                      <Check className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {inviteFriendError && (
              <p className="text-red-400 text-sm mb-4">{inviteFriendError}</p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInviteFriendModal(false)
                  setSelectedFriendToInvite(null)
                  setInviteFriendError('')
                }}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteFriend}
                disabled={!selectedFriendToInvite || inviteFriendMutation.isPending || friendsList.length === 0}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
              >
                {inviteFriendMutation.isPending ? 'Inviting...' : 'Invite Friend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
