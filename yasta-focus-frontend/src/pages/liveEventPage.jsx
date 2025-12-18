import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  StreamVideo, 
  StreamVideoClient, 
  StreamCall,
  SpeakerLayout,
  CallControls,
  useCallStateHooks
} from '@stream-io/video-react-sdk'
import { StreamChat } from 'stream-chat'
import { Chat, Channel, ChannelHeader, MessageList, MessageInput, Thread, Window } from 'stream-chat-react'
import { ArrowLeft, MessageSquare, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'
import { useGetStreamToken, useGetEvents } from '../services/communityServices'
import { useUser } from '../services/authServices'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import 'stream-chat-react/dist/css/v2/index.css'

// Custom call controls with enhanced styling
function CustomCallControls({ onLeave }) {
  const { useMicrophoneState, useCameraState, useParticipants } = useCallStateHooks()
  const { microphone, isMute: isMicMuted } = useMicrophoneState()
  const { camera, isMute: isCameraMuted } = useCameraState()
  const participants = useParticipants()

  const handleMicToggle = async () => {
    try {
      if (isMicMuted) {
        await microphone.enable()
        console.log('Microphone enabled and publishing')
      } else {
        await microphone.disable()
        console.log('Microphone disabled')
      }
    } catch (error) {
      console.error('Microphone toggle error:', error)
    }
  }

  const handleCameraToggle = async () => {
    try {
      if (isCameraMuted) {
        await camera.enable()
        console.log('Camera enabled and publishing')
      } else {
        await camera.disable()
        console.log('Camera disabled')
      }
    } catch (error) {
      console.error('Camera toggle error:', error)
    }
  }

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-6 py-5">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Participant count */}
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>{participants.length} {participants.length === 1 ? 'participant' : 'participants'}</span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMicToggle}
            className={`group relative p-4 rounded-full transition-all duration-200 ${
              isMicMuted 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                : 'bg-slate-700/80 hover:bg-slate-600 backdrop-blur-sm'
            }`}
            title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMicMuted ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isMicMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>
          
          <button
            onClick={handleCameraToggle}
            className={`group relative p-4 rounded-full transition-all duration-200 ${
              isCameraMuted 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                : 'bg-slate-700/80 hover:bg-slate-600 backdrop-blur-sm'
            }`}
            title={isCameraMuted ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraMuted ? <VideoOff size={22} className="text-white" /> : <Video size={22} className="text-white" />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isCameraMuted ? 'Start video' : 'Stop video'}
            </span>
          </button>
          
          <button
            onClick={onLeave}
            className="group relative p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/30 ml-2"
            title="Leave call"
          >
            <PhoneOff size={22} className="text-white" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Leave
            </span>
          </button>
        </div>

        {/* Spacer for balance */}
        <div className="w-24"></div>
      </div>
    </div>
  )
}

export default function LiveEventPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { data: currentUser } = useUser()
  const { data: streamData, isLoading } = useGetStreamToken()
  const { data: events = [] } = useGetEvents()
  
  // Find the current event by ID
  const currentEvent = events.find(e => e.id === (eventId))
  const eventName = currentEvent?.title || `Event ${eventId}`
  
  const [videoClient, setVideoClient] = useState(null)
  const [chatClient, setChatClient] = useState(null)
  const [call, setCall] = useState(null)
  const [channel, setChannel] = useState(null)
  const [showChat, setShowChat] = useState(true)
  
  const initializedRef = useRef(false)
  // Store refs to clients for cleanup
  const videoClientRef = useRef(null)
  const chatClientRef = useRef(null)
  const callRef = useRef(null)
  const cleanupInProgressRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initializedRef.current) return
    
    const initializeStream = async () => {
      console.log('Stream data:', streamData)
      console.log('Current user:', currentUser)
      
      if (!streamData || !currentUser?.data?.user) {
        console.log('Missing data - streamData:', !!streamData, 'currentUser:', !!currentUser?.data?.user)
        return
      }

      // Wait for any ongoing cleanup to finish
      if (cleanupInProgressRef.current) {
        console.log('Cleanup in progress, waiting...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      initializedRef.current = true
      
      const userId = streamData.userId
      const username = streamData.username
      const token = streamData.token
      const apiKey = streamData.apiKey || import.meta.env.VITE_STREAM_API_KEY
      
      console.log('Initializing with:', { userId, username, hasToken: !!token, apiKey })
      
      if (!token || !apiKey) {
        console.error('Missing Stream credentials - token:', !!token, 'apiKey:', !!apiKey)
        return
      }
      
      try {
        // Initialize Video Client (use singleton pattern)
        console.log('Creating video client...')
        const videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: userId,
            name: username,
          },
          token: token,
        })
        
        videoClientRef.current = videoClient
        setVideoClient(videoClient)
        console.log('Video client created')
        
        // Join or create call
        console.log('Joining call...')
        const eventCall = videoClient.call('default', `event-${eventId}`)
        
        // Join call
        await eventCall.join({ 
          create: true,
          data: {
            members: [{ user_id: userId }],
          }
        })
        
        // Disable camera and mic after joining (start with both off)
        try {
          await eventCall.camera.disable()
          await eventCall.microphone.disable()
          console.log('Camera and mic disabled on join')
        } catch (err) {
          console.log('Could not disable devices on join:', err)
        }
        
        callRef.current = eventCall
        setCall(eventCall)
        console.log('Call joined successfully')
        
        // Initialize Chat Client
        console.log('Creating chat client...')
        const chatClient = StreamChat.getInstance(apiKey)
        await chatClient.connectUser(
          {
            id: userId,
            name: username,
          },
          token
        )
        
        chatClientRef.current = chatClient
        setChatClient(chatClient)
        console.log('Chat client connected')
        
        // Join or create channel with proper permissions
        // Using 'livestream' type which is more permissive by default
        const eventChannel = chatClient.channel('livestream', `event-${eventId}`, {
          name: eventName,
          created_by_id: userId,
        })
        
        // Watch with state = true to get existing messages
        await eventChannel.watch({ state: true })
        setChannel(eventChannel)
        console.log('Channel joined successfully')
        
      } catch (error) {
        console.error('Error initializing Stream:', error)
        initializedRef.current = false
      }
    }

    initializeStream()

    return () => {
      // Synchronous cleanup using refs - React will wait for this
      console.log('Component unmounting - cleaning up...')
      cleanupInProgressRef.current = true
      initializedRef.current = false
      
      // Clear channel before disconnecting chat
      setChannel(null)
      
      // Clean up call - use a Promise chain to ensure it completes
      const cleanupPromises = []
      
      if (callRef.current) {
        console.log('Leaving call in cleanup...')
        cleanupPromises.push(
          callRef.current.leave()
            .then(() => {
              console.log('Successfully left call')
              callRef.current = null
              setCall(null)
            })
            .catch(err => console.error('Error leaving call:', err))
        )
      }
      
      if (chatClientRef.current) {
        console.log('Disconnecting chat in cleanup...')
        cleanupPromises.push(
          chatClientRef.current.disconnectUser()
            .then(() => {
              console.log('Successfully disconnected chat')
              chatClientRef.current = null
              setChatClient(null)
            })
            .catch(err => console.error('Error disconnecting chat:', err))
        )
      }
      
      if (videoClientRef.current) {
        console.log('Clearing video client in cleanup...')
        videoClientRef.current = null
        setVideoClient(null)
      }
      
      // Wait for cleanup to complete before allowing reinitialization
      Promise.all(cleanupPromises).finally(() => {
        cleanupInProgressRef.current = false
        console.log('Cleanup complete')
      })
    }
  }, [streamData, currentUser, eventId, eventName])

  const leaveCall = async () => {
    if (cleanupInProgressRef.current) {
      console.log('Cleanup already in progress')
      return
    }
    
    try {
      console.log('User manually leaving call...')
      cleanupInProgressRef.current = true
      
      // Reset initialization flag so user can rejoin later
      initializedRef.current = false
      
      // Clear chat first
      setChannel(null)
      
      // Create array to ensure all cleanup happens
      const cleanupTasks = []
      
      if (callRef.current) {
        console.log('Leaving video call...')
        cleanupTasks.push(
          callRef.current.leave()
            .then(() => {
              console.log('Successfully left video call')
              callRef.current = null
              setCall(null)
            })
        )
      }
      
      if (chatClientRef.current) {
        console.log('Disconnecting chat...')
        cleanupTasks.push(
          chatClientRef.current.disconnectUser()
            .then(() => {
              console.log('Successfully disconnected chat')
              chatClientRef.current = null
              setChatClient(null)
            })
        )
      }
      
      // Wait for all cleanup to complete
      await Promise.all(cleanupTasks)
      
      if (videoClientRef.current) {
        videoClientRef.current = null
        setVideoClient(null)
      }
      
      console.log('All cleanup complete, navigating away')
      cleanupInProgressRef.current = false
      
      // Small delay to ensure server processes the leave
      await new Promise(resolve => setTimeout(resolve, 300))
      navigate(-1)
    } catch (error) {
      console.error('Error leaving call:', error)
      cleanupInProgressRef.current = false
      // Navigate anyway even if there was an error
      navigate(-1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading event...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={leaveCall}
              className="text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{eventName}</h1>
              <p className="text-sm text-slate-400">Live Event</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-lg transition-all duration-200 ${
                showChat 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {videoClient && call ? (
            <StreamVideo client={videoClient}>
              <StreamCall call={call}>
                <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-950">
                  <style>{`
                    /* Custom Stream SDK styling */
                    .str-video__speaker-layout {
                      background: transparent !important;
                    }
                    .str-video__participant-view {
                      border-radius: 12px !important;
                      overflow: hidden !important;
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
                    }
                    .str-video__participant-details {
                      background: transparent !important;
                      backdrop-filter: none !important;
                      border-radius: 0 !important;
                      padding: 4px 8px !important;
                    }
                    .str-video__participant-details__name {
                      font-size: 11px !important;
                      font-weight: 500 !important;
                      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) !important;
                    }
                    .str-video__avatar {
                      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
                    }
                  `}</style>
                  <SpeakerLayout participantsBarPosition="bottom" />
                </div>
                <CustomCallControls onLeave={leaveCall} />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <div className="text-slate-400 text-lg">Connecting to video call...</div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && chatClient && channel && chatClient.userID && (
          <div className="w-96 bg-slate-800/95 backdrop-blur-md border-l border-slate-700/50 flex flex-col shadow-2xl">
            <style>{`
              /* Custom chat styling */
              .str-chat__theme-dark {
                --str-chat__primary-color: #6366f1;
                --str-chat__active-primary-color: #818cf8;
                --str-chat__surface-color: rgb(30, 41, 59);
                --str-chat__secondary-surface-color: rgb(15, 23, 42);
                --str-chat__border-radius-circle: 12px;
              }
              .str-chat__channel-header {
                background: rgba(15, 23, 42, 0.8) !important;
                backdrop-filter: blur(8px) !important;
                border-bottom: 1px solid rgba(71, 85, 105, 0.3) !important;
              }
              .str-chat__list {
                background: transparent !important;
              }
              .str-chat__message-simple__actions {
                background: rgba(30, 41, 59, 0.95) !important;
              }
              .str-chat__message-input {
                background: rgba(15, 23, 42, 0.8) !important;
                backdrop-filter: blur(8px) !important;
                border-top: 1px solid rgba(71, 85, 105, 0.3) !important;
              }
            `}</style>
            <Chat client={chatClient} theme="str-chat__theme-dark">
              <Channel channel={channel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            </Chat>
          </div>
        )}
      </div>
    </div>
  )
}
