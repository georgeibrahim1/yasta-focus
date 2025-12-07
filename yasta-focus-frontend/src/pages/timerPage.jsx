import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../components/Input'
import Select from '../components/Select'
import Timer from '../components/Timer'
import { Clock, Book, CheckSquare } from 'lucide-react'
import { useGetSubjects } from '../services/subjectServices'
import { useGetTasks } from '../services/subjectServices'
import { useCreateSession } from '../services/timerServices'

export default function TimerPage() {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionConfig, setSessionConfig] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('')

  const { data: subjectsData, isLoading: subjectsLoading } = useGetSubjects()
  const { data: tasksData, refetch: refetchTasks } = useGetTasks(selectedSubject, { enabled: !!selectedSubject })
  const createSession = useCreateSession()

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      sessionName: 'Focus Session',
      type: 'focus',
      subject_name: '',
      task_title: '',
      duration: '25',
    }
  })

  const watchType = watch('type')
  const watchSubject = watch('subject_name')

  useEffect(() => {
    if (watchSubject !== selectedSubject) {
      setSelectedSubject(watchSubject)
      setValue('task_title', '') // Reset task when subject changes
    }
  }, [watchSubject, selectedSubject, setValue])

  const sessionTypes = [
    { value: 'focus', label: 'Focus' },
    { value: 'break', label: 'Break' },
  ]

  const durationOptions = [
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '20', label: '20 minutes' },
    { value: '25', label: '25 minutes (Pomodoro)' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' },
    { value: '90', label: '90 minutes' },
  ]

  const subjects = subjectsData?.data?.subjects || []
  const subjectOptions = subjects.map(s => ({
    value: s.subject_name,
    label: s.subject_name
  }))

  const tasks = tasksData?.data?.tasks || []
  // Filter to show only Not Started and In Progress tasks
  const filteredTasks = tasks.filter(t => t.status === 'Not Started' || t.status === 'In Progress')
  const taskOptions = filteredTasks.map(t => ({
    value: t.task_title,
    label: `${t.task_title} (${t.status})`
  }))

  const onSubmit = (data) => {
    setSessionConfig({
      session_name: data.sessionName,
      type: data.type,
      subject_name: data.subject_name || null,
      task_title: data.task_title || null,
      duration: parseInt(data.duration),
    })
    setIsSessionActive(true)
  }

  const handleSessionEnd = async (sessionData) => {
    try {
      // Save session to backend when user ends it
      await createSession.mutateAsync(sessionData)
      // Refetch tasks to show updated status
      if (sessionData.task_title && sessionData.subject_name) {
        await refetchTasks()
      }
      setIsSessionActive(false)
      setSessionConfig(null)
      reset()
    } catch {
      // Error is handled by the mutation hook with toast
      setIsSessionActive(false)
      setSessionConfig(null)
      reset()
    }
  }

  const handleSessionCancel = () => {
    // Cancel without saving
    setIsSessionActive(false)
    setSessionConfig(null)
    reset()
  }

  if (isSessionActive && sessionConfig) {
    return (
      <div className="min-h-screen bg-[#10121A] flex items-center justify-center p-6">
        <Timer
          sessionConfig={sessionConfig}
          onSessionEnd={handleSessionEnd}
          onSessionCancel={handleSessionCancel}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#10121A] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Start a Timer Session</h1>
          <p className="text-slate-400">Configure your timer and stay focused</p>
        </div>

        {/* Form Container */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-30"></div>
          
          {/* Form */}
          <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Session Name - Editable */}
              <Input
                id="sessionName"
                label="Session Name"
                placeholder="e.g., Morning Study Session"
                leftIcon={Clock}
                {...register('sessionName', {
                  required: 'Session name is required'
                })}
                error={errors.sessionName?.message}
              />

              {/* Session Type - Only Focus or Break */}
              <Select
                id="type"
                label="Session Type"
                placeholder="Select session type"
                options={sessionTypes}
                leftIcon={CheckSquare}
                required
                {...register('type', {
                  required: 'Please select a session type'
                })}
                error={errors.type?.message}
              />

              {/* Subject - Required, from user's subjects */}
              {watchType === 'focus' && (
                <>
                  <Select
                    id="subject_name"
                    label="Subject"
                    placeholder={subjectsLoading ? 'Loading subjects...' : 'Select a subject'}
                    options={subjectOptions}
                    leftIcon={Book}
                    required
                    disabled={subjectsLoading || subjectOptions.length === 0}
                    {...register('subject_name', {
                      required: watchType === 'focus' ? 'Please select a subject for focus session' : false
                    })}
                    error={errors.subject_name?.message}
                  />

                  {subjectOptions.length === 0 && !subjectsLoading && (
                    <p className="text-sm text-amber-400 -mt-4">
                      ⚠️ You don&apos;t have any subjects yet. Create one first!
                    </p>
                  )}

                  {/* Task - Optional, from selected subject's tasks */}
                  {selectedSubject && (
                    <Select
                      id="task_title"
                      label="Task (Optional)"
                      placeholder={taskOptions.length > 0 ? 'Select a task' : 'No tasks available'}
                      options={taskOptions}
                      leftIcon={CheckSquare}
                      disabled={taskOptions.length === 0}
                      {...register('task_title')}
                      error={errors.task_title?.message}
                    />
                  )}
                </>
              )}

              {/* Duration */}
              <Select
                id="duration"
                label="Duration"
                placeholder="Select duration"
                options={durationOptions}
                leftIcon={Clock}
                required
                {...register('duration', {
                  required: 'Please select a duration'
                })}
                error={errors.duration?.message}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={watchType === 'focus' && (!watchSubject || subjectOptions.length === 0)}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
              >
                Start Session
              </button>
            </form>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">💡 Timer Tips</h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <strong>Focus sessions</strong> require a subject selection</li>
            <li>• <strong>Break sessions</strong> don&apos;t require a subject</li>
            <li>• Task selection is optional for focus sessions</li>
            <li>• Sessions are saved only when you click &quot;End Session&quot;</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
