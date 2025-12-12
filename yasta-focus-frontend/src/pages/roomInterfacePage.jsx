import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Users, Clock, Play, Pause, Square, BookOpen } from 'lucide-react'
import { useUser } from '../services/authServices'
import { useGetSubjects } from '../services/subjectServices'
import { useStudyRooms } from '../services/studyRoomServices'
import { useCommunityMembers } from '../services/communityServices'
import { useSocket } from '../hooks/useSocket'
import { useRoomChat } from '../hooks/useRoomChat'
import { useRoomSession } from '../hooks/useRoomSession'
import socketService from '../services/socketService'

export default function RoomInterfacePage() {
  const { communityId, roomCode } = useParams()
  const navigate = useNavigate()
  const { data: currentUser } = useUser()
  const user = currentUser?.data?.user || currentUser?.user || currentUser
  const userId = user?.user_id

  // Fetch user subjects
  const { data: subjectsData } = useGetSubjects()
  const subjects = subjectsData?.data?.subjects || []

  // Fetch rooms to check membership
  const { data: rooms = [], isLoading: roomsLoading } = useStudyRooms(communityId, '')
  
  // Check if user is a community manager
  const { data: membersData, isLoading: membersLoading } = useCommunityMembers(communityId)
  const currentUserIsManager = membersData?.currentUserIsManager || false

  // Socket connection
  const token = localStorage.getItem('token')
  const { isConnected } = useSocket(token)

  // Room state
  const [isInRoom, setIsInRoom] = useState(false)
  const [roomMembers, setRoomMembers] = useState([])

  // Chat
  const { messages, sendMessage, isLoading: chatLoading } = useRoomChat(roomCode, communityId, isInRoom)
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef(null)

  // Session
  const { activeSessions, mySession, startSession, updateSession, pauseSession, resumeSession, endSession } = 
    useRoomSession(roomCode, communityId, isInRoom, userId)
  
  const [selectedSubject, setSelectedSubject] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerIntervalRef = useRef(null)
  const updateIntervalRef = useRef(null)

  // Single consolidated check for room access
  useEffect(() => {
    if (!roomsLoading && !membersLoading && rooms.length > 0 && userId && isConnected && !isInRoom) {
      
      // Check if user is a member of THIS specific room
      const thisRoom = rooms.find(room => room.room_code === parseInt(roomCode))
      const isMemberOfThisRoom = thisRoom?.members?.some(member => member.user_id === userId)

      // If not a member of this room, check if member of another room (skip for managers)
      if (!isMemberOfThisRoom) {
        // Managers can access and join any room without restrictions
        if (!currentUserIsManager) {
          const userOtherRoom = rooms.find(room => 
            room.room_code !== parseInt(roomCode) && 
            room.members?.some(member => member.user_id === userId)
          )

          if (userOtherRoom) {
            alert(`You're currently a member of "${userOtherRoom.room_name}". Please leave that room first.`)
            navigate(`/communities/${communityId}/rooms`, { replace: true })
            return
          }
          
          // Not a member and not a manager - navigate back silently
          navigate(`/communities/${communityId}/rooms`, { replace: true })
          return
        }
      }

      // User IS a member of this room (or is a manager) - join via socket
      const roomInfo = {
        roomId: `${communityId}_${roomCode}`,
        roomCode: roomCode,
        communityId: communityId,
        roomName: thisRoom?.room_name || `Room #${roomCode}`
      }
      localStorage.setItem('activeRoom', JSON.stringify(roomInfo))
      
      socketService.joinRoom(parseInt(roomCode), communityId)
      setIsInRoom(true)
    }
  }, [rooms, roomsLoading, membersLoading, currentUserIsManager, userId, roomCode, communityId, isConnected, navigate, isInRoom])

  // Prevent navigation/page close with active session
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (mySession && isRunning) {
        e.preventDefault()
        e.returnValue = 'You have an active session. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [mySession, isRunning])

  // Setup socket event listeners
  useEffect(() => {
    if (!isInRoom) return

    // Listen for room state
    const handleRoomState = ({ members, activeSessions: sessions }) => {
      setRoomMembers(members || [])
    }

    // Listen for user joined
    const handleUserJoined = ({ userId: newUserId, userName }) => {
      console.log(`${userName} joined the room`)
    }

    // Listen for user left
    const handleUserLeft = ({ userId: leftUserId, userName }) => {
      console.log(`${userName} left the room`)
      setRoomMembers((prev) => prev.filter(m => m.student_id !== leftUserId))
    }

    // Listen for socket errors
    const handleError = ({ message }) => {
      alert(message || 'Failed to join room')
      navigate(`/communities/${communityId}/rooms`, { replace: true })
    }

    socketService.on('room_state', handleRoomState)
    socketService.on('user_joined', handleUserJoined)
    socketService.on('user_left', handleUserLeft)
    socketService.on('error', handleError)

    return () => {
      socketService.off('room_state', handleRoomState)
      socketService.off('user_joined', handleUserJoined)
      socketService.off('user_left', handleUserLeft)
      socketService.off('error', handleError)
      socketService.leaveRoom(parseInt(roomCode), communityId)
      localStorage.removeItem('activeRoom')
      setIsInRoom(false)
    }
  }, [isInRoom, roomCode, communityId, navigate])

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Timer logic
  useEffect(() => {
    if (isRunning && mySession) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)

      // Update server every 30 seconds
      updateIntervalRef.current = setInterval(() => {
        updateSession(mySession.sessionName, elapsedTime)
      }, 30000)

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
      }
    }
  }, [isRunning, mySession, elapsedTime, updateSession])

  // Format time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageInput.trim()) {
      sendMessage(messageInput)
      setMessageInput('')
    }
  }

  // Handle start session
  const handleStartSession = () => {
    if (!selectedSubject) return
    startSession(selectedSubject, null)
    setElapsedTime(0)
    setIsRunning(true)
  }

  // Handle pause/resume
  const handlePauseResume = () => {
    if (!mySession) return
    
    if (isRunning) {
      pauseSession(mySession.sessionName)
      setIsRunning(false)
    } else {
      resumeSession(mySession.sessionName)
      setIsRunning(true)
    }
  }

  // Handle end session
  const handleEndSession = () => {
    if (!mySession) return
    endSession(mySession.sessionName, elapsedTime)
    setElapsedTime(0)
    setIsRunning(false)
  }

  // Handle leave room
  const handleLeaveRoom = () => {
    if (mySession && isRunning) {
      if (!window.confirm('You have an active session. Are you sure you want to leave?')) {
        return
      }
      endSession(mySession.sessionName, elapsedTime)
    }
    localStorage.removeItem('activeRoom')
    navigate(`/communities/${communityId}/rooms`)
  }

  if (roomsLoading || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">{roomsLoading ? 'Checking permissions...' : 'Connecting...'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveRoom}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Study Room</h1>
              <p className="text-slate-400 text-sm">{roomMembers.length} members online</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users size={18} />
            <span className="text-sm">{activeSessions.length} studying</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-900">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatLoading ? (
              <div className="text-center text-slate-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.messageId || msg.message_id}
                  className={`flex ${msg.userId === userId || msg.user_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${msg.userId === userId || msg.user_id === userId ? 'bg-indigo-600' : 'bg-slate-700'} rounded-lg p-3`}>
                    {(msg.userId !== userId && msg.user_id !== userId) && (
                      <div className="text-xs text-slate-300 mb-1 font-semibold">
                        {msg.userName || msg.username}
                      </div>
                    )}
                    <div className="text-white text-sm">{msg.content}</div>
                    <div className="text-xs text-slate-300 mt-1">
                      {new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* Session Controls */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock size={18} />
              Your Session
            </h3>

            {!mySession ? (
              <div className="space-y-3">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.subject_name} value={subject.subject_name}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <p className="text-slate-400 text-xs text-center mt-1">
                    No subjects found. Create subjects in the Subjects page.
                  </p>
                )}
                <button
                  onClick={handleStartSession}
                  disabled={!selectedSubject}
                  className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  Start Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{formatTime(elapsedTime)}</div>
                  <div className="text-slate-400 text-sm">{mySession.subjectName || mySession.subject_name}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePauseResume}
                    className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                    {isRunning ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={handleEndSession}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Square size={18} />
                    End
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Sessions */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BookOpen size={18} />
              Active Sessions ({activeSessions.filter(s => s.status === 'active' || s.status === 'paused').length})
            </h3>
            <div className="space-y-2">
              {activeSessions.filter(s => s.status === 'active' || s.status === 'paused').map((session) => (
                <div
                  key={session.sessionName || session.session_name}
                  className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50"
                >
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {session.userName || session.username}
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      {session.subjectName || session.subject_name}
                    </div>
                  </div>
                </div>
              ))}
              {activeSessions.filter(s => s.status === 'active' || s.status === 'paused').length === 0 && (
                <div className="text-slate-400 text-sm text-center py-4">
                  No active sessions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
