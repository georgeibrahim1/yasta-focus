import { useState, useEffect, useRef, useCallback } from 'react'
import { Pause, Play, X } from 'lucide-react'

export default function Timer({ sessionConfig, onSessionEnd, onSessionCancel }) {
  const { session_name, type, subject_name, task_title, duration } = sessionConfig
  
  const [timeLeft, setTimeLeft] = useState(duration * 60) // Convert to seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentPhase] = useState(0) // For progress dots
  const totalPhases = 4
  
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const elapsedTimeRef = useRef(0)
  const actualStudyTimeRef = useRef(0) // Track actual study time in seconds (excluding pauses)

  const handleSessionComplete = useCallback(() => {
    // Calculate end time based on actual study time (excluding pauses)
    const startTime = new Date()
    const actualDurationMs = actualStudyTimeRef.current * 1000
    const endTime = new Date(startTime.getTime() + actualDurationMs)

    // Prepare session data to save when timer completes
    const sessionData = {
      session_name,
      type,
      subject_name: subject_name || null,
      task_title: task_title || null,
      started_at: startTime.toISOString(),
      ended_at: endTime.toISOString()
    }
    onSessionEnd(sessionData)
  }, [session_name, type, subject_name, task_title, onSessionEnd])

  useEffect(() => {
    if (isRunning && !isPaused) {
      startTimeRef.current = Date.now() - (elapsedTimeRef.current * 1000)
      
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current) / 1000)
        const remaining = (duration * 60) - elapsed
        
        if (remaining <= 0) {
          clearInterval(intervalRef.current)
          setTimeLeft(0)
          setIsRunning(false)
          actualStudyTimeRef.current = duration * 60 // Full duration completed
          handleSessionComplete()
        } else {
          setTimeLeft(remaining)
          elapsedTimeRef.current = elapsed
          actualStudyTimeRef.current = elapsed // Track actual active time
        }
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

      return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, duration, handleSessionComplete])

  const handleEndSession = () => {
    // User manually ends session - save it with actual study time
    const startTime = new Date()
    const actualDurationMs = actualStudyTimeRef.current * 1000
    const endTime = new Date(startTime.getTime() + actualDurationMs)

    const sessionData = {
      session_name,
      type,
      subject_name: subject_name || null,
      task_title: task_title || null,
      started_at: startTime.toISOString(),
      ended_at: endTime.toISOString()
    }
    onSessionEnd(sessionData)
  }

  const toggleTimer = () => {
    if (!isRunning && !isPaused) {
      // Start timer
      setIsRunning(true)
      setIsPaused(false)
    } else if (isRunning && !isPaused) {
      // Pause timer
      setIsPaused(true)
    } else if (isPaused) {
      // Resume timer
      setIsPaused(false)
    }
  }

  const handleCancel = () => {
    // Cancel without saving
    if (window.confirm('Cancel this session? It will not be saved.')) {
      onSessionCancel()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100
  const circumference = 2 * Math.PI * 160
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex items-center justify-center gap-12">
      {/* Timer Circle */}
      <div className="relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-glow"></div>
        
        {/* SVG Circle */}
        <div className="relative">
          <svg width="400" height="400" className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="200"
              cy="200"
              r="160"
              stroke="#1e293b"
              strokeWidth="20"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="200"
              cy="200"
              r="160"
              stroke="url(#gradient)"
              strokeWidth="20"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-linear"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 text-lg mb-2">{session_name}</p>
              <div className="text-7xl font-bold text-white mb-4">
                {formatTime(timeLeft)}
              </div>
              
              {/* Progress Dots */}
              <div className="flex gap-2 justify-center">
                {[...Array(totalPhases)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentPhase
                        ? 'bg-indigo-500'
                        : i < currentPhase
                        ? 'bg-slate-500'
                        : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={toggleTimer}
            className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl text-white transition-all shadow-lg hover:shadow-indigo-500/50"
          >
            {isRunning && !isPaused ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-1" />
            )}
          </button>

          <button
            onClick={handleCancel}
            className="p-3 bg-slate-800/50 hover:bg-red-900/40 border border-slate-700 hover:border-red-800/50 rounded-xl text-slate-400 hover:text-red-300 transition-all"
            title="Cancel session (won't be saved)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Session Info Cards */}
      <div className="flex flex-col gap-4 w-[500px]">
        {/* Session Type */}
        <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              type === 'focus' ? 'bg-indigo-500/20' : 'bg-green-500/20'
            }`}>
              <span className="text-2xl">{type === 'focus' ? '🎯' : '☕'}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Session Type</p>
              <p className="text-lg font-semibold text-white capitalize">{type}</p>
            </div>
          </div>
        </div>

        {/* Current Subject */}
        {subject_name && (
          <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400">Current Subject</p>
                <p className="text-lg font-semibold text-white">{subject_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Task */}
        {task_title && (
          <div className="p-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400">Current Task</p>
                <p className="text-lg font-semibold text-white">{task_title}</p>
              </div>
              <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                  <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* End Session Button */}
        <button
          onClick={handleEndSession}
          className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-green-500/50"
        >
          End Session & Save
        </button>
      </div>
    </div>
  )
}
