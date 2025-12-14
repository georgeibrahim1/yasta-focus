import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Trash2, Edit2, Bot } from 'lucide-react'
import SubjectChat from '../components/SubjectChat'
import { useGetSubjects, useGetNotes, useGetNote, useUpdateNote, useDeleteNote, useGetTasks, useUpdateTask, useToggleTask, useDeleteTask, useCreateSubject, useCreateNote } from '../services/subjectServices'
import { useGetDecks, useDeleteDeck, useCreateDeck } from '../services/deckServices'
import { useCreateTask } from '../services/subjectServices'
import SubjectModal from '../components/SubjectModal'
import NoteModal from '../components/NoteModal'
import NoteEditor from '../components/NoteEditor'
import TaskModal from '../components/TaskModal'
import DeckModal from '../components/DeckModal'

export default function SubjectsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('notes')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showNoteEditor, setShowNoteEditor] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [editingNoteTitle, setEditingNoteTitle] = useState(null)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskSortBy, setTaskSortBy] = useState('none')
  const [taskFilterStatus, setTaskFilterStatus] = useState('all')
  const [hideCompleted, setHideCompleted] = useState(false)
  const [showDeckModal, setShowDeckModal] = useState(false)
  const [newSubject, setNewSubject] = useState({ subject_name: '', description: '' })
  const [newNote, setNewNote] = useState({ note_title: '', note_text: '' })
  const [newTask, setNewTask] = useState({ task_title: '', description: '', deadline: null, status: 'Not Started' })
  const [newDeck, setNewDeck] = useState({ deck_title: '', deck__desc: '', reminder_by: '' })
  const [chatMessages, setChatMessages] = useState([]) // Persist chat messages

  // Fetch subjects
  const { data: subjectsData } = useGetSubjects()
  const subjects = useMemo(() => subjectsData?.data?.subjects || [], [subjectsData])

  // Set first subject as selected if none selected
  useEffect(() => {
    if (!selectedSubject && subjects.length > 0) {
      setSelectedSubject(subjects[0].subject_name)
    }
  }, [subjects, selectedSubject])

  // Fetch data based on selected subject and active tab
  const { data: notesData } = useGetNotes(selectedSubject)
  const { data: tasksData } = useGetTasks(selectedSubject)
  const { data: decksData } = useGetDecks(selectedSubject)

  const deleteNoteMutation = useDeleteNote()
  const updateNoteMutation = useUpdateNote()
  const { data: noteData } = useGetNote(selectedSubject, editingNote?.note_title)
  const toggleTaskMutation = useToggleTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const deleteDeckMutation = useDeleteDeck()
  const createSubjectMutation = useCreateSubject()
  const createNoteMutation = useCreateNote()
  const createTaskMutation = useCreateTask()
  const createDeckMutation = useCreateDeck()

  const handleCreateSubject = () => {
    createSubjectMutation.mutate(newSubject, {
      onSuccess: () => {
        setShowSubjectModal(false)
        setNewSubject({ subject_name: '', description: '' })
      }
    })
  }

  const handleCreateNote = () => {
    createNoteMutation.mutate({ subjectName: selectedSubject, noteData: { ...newNote, note_text: '' } }, {
      onSuccess: (data) => {
        setShowNoteModal(false)
        setNewNote({ note_title: '', note_text: '' })
        // Open editor immediately after creation
        setEditingNote({ note_title: newNote.note_title })
        setShowNoteEditor(true)
      }
    })
  }

  const handleUpdateNote = (content) => {
    updateNoteMutation.mutate({ 
      subjectName: selectedSubject, 
      noteTitle: editingNote.note_title, 
      updateData: { note_text: content } 
    }, {
      onSuccess: () => {
        setShowNoteEditor(false)
        setEditingNote(null)
      }
    })
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowNoteEditor(true)
  }

  const handleEditNoteTitle = (note) => {
    setEditingNoteTitle(note.note_title)
    setNewNoteTitle(note.note_title)
  }

  const handleSaveNoteTitle = async (oldTitle) => {
    if (newNoteTitle && newNoteTitle !== oldTitle && newNoteTitle.trim()) {
      // Get the current note content first
      const currentNote = notes.find(n => n.note_title === oldTitle)
      if (currentNote) {
        try {
          // Create new note with new title and same content first
          await createNoteMutation.mutateAsync({ 
            subjectName: selectedSubject, 
            noteData: { note_title: newNoteTitle, note_text: currentNote.note_text || '' } 
          })
          // Then delete old note
          await deleteNoteMutation.mutateAsync({ 
            subjectName: selectedSubject, 
            noteTitle: oldTitle 
          })
        } catch (error) {
          console.error('Error updating note title:', error)
        }
      }
    }
    setEditingNoteTitle(null)
    setNewNoteTitle('')
  }

  const handleCreateTask = () => {
    createTaskMutation.mutate({ subjectName: selectedSubject, taskData: newTask }, {
      onSuccess: () => {
        setShowTaskModal(false)
        setEditingTask(null)
        setNewTask({ task_title: '', description: '', deadline: null, status: 'Not Started' })
      }
    })
  }

  const handleUpdateTask = async () => {
    // If title changed, need to delete old and create new (since title is part of primary key)
    if (newTask.task_title !== editingTask.task_title) {
      try {
        await createTaskMutation.mutateAsync({ 
          subjectName: selectedSubject, 
          taskData: newTask
        })
        await deleteTaskMutation.mutateAsync({ 
          subjectName: selectedSubject, 
          taskTitle: editingTask.task_title 
        })
        setShowTaskModal(false)
        setEditingTask(null)
        setNewTask({ task_title: '', description: '', deadline: null, status: 'Not Started' })
      } catch (error) {
        console.error('Error updating task:', error)
      }
    } else {
      // Title didn't change, just update other fields
      updateTaskMutation.mutate({ 
        subjectName: selectedSubject, 
        taskTitle: editingTask.task_title, 
        updateData: { 
          description: newTask.description, 
          deadline: newTask.deadline,
          status: newTask.status
        } 
      }, {
        onSuccess: () => {
          setShowTaskModal(false)
          setEditingTask(null)
          setNewTask({ task_title: '', description: '', deadline: null, status: 'Not Started' })
        }
      })
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setNewTask({
      task_title: task.task_title,
      description: task.description || '',
      deadline: task.deadline || null,
      status: task.status || 'Not Started'
    })
    setShowTaskModal(true)
  }

  const handleCreateDeck = () => {
    createDeckMutation.mutate({ subjectName: selectedSubject, deckData: newDeck }, {
      onSuccess: () => {
        setShowDeckModal(false)
        setNewDeck({ deck_title: '', deck__desc: '', reminder_by: '' })
      }
    })
  }

  const notes = notesData?.data?.notes || []
  const tasks = tasksData?.data?.tasks || []
  const decks = decksData?.data?.decks || []

  // Filter by title only
  const filteredNotes = notes.filter(note =>
    note.note_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task =>
      task.task_title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Hide completed if toggled
    if (hideCompleted) {
      filtered = filtered.filter(task => task.status !== 'Done')
    }

    // Filter by status
    if (taskFilterStatus !== 'all') {
      if (taskFilterStatus === 'done') {
        filtered = filtered.filter(task => task.status === 'Done')
      } else if (taskFilterStatus === 'not-started') {
        filtered = filtered.filter(task => task.status === 'Not Started')
      } else if (taskFilterStatus === 'in-progress') {
        filtered = filtered.filter(task => task.status === 'In Progress')
      }
    }

    // Sort tasks
    if (taskSortBy === 'deadline-asc') {
      filtered.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
    } else if (taskSortBy === 'deadline-desc') {
      filtered.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(b.deadline) - new Date(a.deadline)
      })
    } else if (taskSortBy === 'status') {
      filtered.sort((a, b) => {
        const statusOrder = { 'Not Started': 0, 'In Progress': 1, 'Done': 2 }
        return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
      })
    }

    return filtered
  }, [tasks, searchQuery, taskFilterStatus, taskSortBy, hideCompleted])

  const filteredDecks = decks.filter(deck =>
    deck.deck_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Empty state when no subjects
  if (subjects.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-[#10121A] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <Plus size={48} className="text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">No Subjects Yet</h2>
              <p className="text-slate-400 text-lg mb-8">
                Create your first subject to start organizing your notes, tasks, and study decks.
              </p>
            </div>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create Your First Subject
            </button>
          </div>
        </div>

        {/* Subject Modal for empty state */}
        <SubjectModal
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          onSubmit={handleCreateSubject}
          formData={newSubject}
          setFormData={setNewSubject}
          isLoading={createSubjectMutation.isPending}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#10121A] flex">
      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          {activeTab === 'chat' ? (
            <>
              <h1 className="text-5xl font-bold text-white mb-3">AI Assistant</h1>
              <p className="text-slate-400 text-lg">
                Ask me anything! I'm here to help with your studies.
              </p>
              <SubjectChat subject="General" messages={chatMessages} setMessages={setChatMessages} />
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-white mb-3">{selectedSubject || 'Select a Subject'}</h1>
              <p className="text-slate-400 text-lg">
                All your notes, tasks, and decks for this subject.
              </p>
            </>
          )}
        </div>

        {/* Search and Tabs - Only show when not in chat mode */}
        {activeTab !== 'chat' && (
        <div className="flex items-center gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('decks')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'decks'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Decks
            </button>
          </div>

          {/* Add Button */}
          <button 
            onClick={() => {
              if (activeTab === 'notes') setShowNoteModal(true)
              else if (activeTab === 'tasks') setShowTaskModal(true)
              else if (activeTab === 'decks') setShowDeckModal(true)
            }}
            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50"
          >
            <Plus size={24} />
          </button>
        </div>
        )}

        {/* Task Filters and Sorting */}
        {activeTab === 'tasks' && (
          <div className="flex gap-3 mb-6">
            <select
              value={taskFilterStatus}
              onChange={(e) => setTaskFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">All Tasks</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              value={taskSortBy}
              onChange={(e) => setTaskSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="none">Sort By</option>
              <option value="deadline-asc">Deadline (Earliest First)</option>
              <option value="deadline-desc">Deadline (Latest First)</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                hideCompleted
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {hideCompleted ? 'Show Completed' : 'Hide Completed'}
            </button>
          </div>
        )}

        {/* Content Grid */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No notes found. Click + to add a new note.
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.note_title}
                  className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer group"
                  onClick={() => handleEditNote(note)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingNoteTitle === note.note_title ? (
                        <input
                          type="text"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          onBlur={() => handleSaveNoteTitle(note.note_title)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveNoteTitle(note.note_title)
                            if (e.key === 'Escape') {
                              setEditingNoteTitle(null)
                              setNewNoteTitle('')
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="w-full px-3 py-1 text-lg font-semibold bg-slate-700 border border-indigo-500 rounded-lg text-white focus:outline-none focus:border-indigo-400"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {note.note_title}
                        </h3>
                      )}
                      <p className="text-sm text-slate-400 mt-1">
                        Click to edit note content
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditNoteTitle(note)
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Edit note title"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNoteMutation.mutate({ subjectName: selectedSubject, noteTitle: note.note_title })
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No tasks found. Click + to add a new task.
              </div>
            ) : (
              filteredTasks.map(task => {
                const isCompleted = task.status === 'Done'
                return (
                <div
                  key={task.task_title}
                  className={`p-5 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all ${
                    isCompleted ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTaskMutation.mutate({ subjectName: selectedSubject, taskTitle: task.task_title })}
                      className="w-5 h-5 mt-1 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${
                          isCompleted ? 'line-through text-slate-500' : 'text-white'
                        }`}>
                          {task.task_title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.status === 'Done'
                            ? 'bg-green-500/20 text-green-400' 
                            : task.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                      )}
                      {task.deadline && (
                        <p className={`text-sm mt-2 ${
                          new Date(task.deadline) < new Date() && !isCompleted
                            ? 'text-red-400 font-semibold'
                            : 'text-slate-500'
                        }`}>
                          {new Date(task.deadline) < new Date() && !isCompleted && '⚠️ '}
                          Deadline: {new Date(task.deadline).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteTaskMutation.mutate({ subjectName: selectedSubject, taskTitle: task.task_title })}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        )}

        {activeTab === 'decks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                No decks found. Click + to add a new deck.
              </div>
            ) : (
              filteredDecks.map(deck => (
                <div
                  key={deck.deck_title}
                  onClick={() => navigate(`/decks/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(deck.deck_title)}`)}
                  className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {deck.deck_title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteDeckMutation.mutate({ subjectName: selectedSubject, deckTitle: deck.deck_title })
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {deck.deck__desc && (
                    <p className="text-slate-400 text-sm mb-4">{deck.deck__desc}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="text-slate-500">
                      Last reviewed: {deck.last_review_date ? new Date(deck.last_review_date).toLocaleDateString() : 'Never'}
                    </div>
                    {deck.last_round_time && (
                      <div className="text-slate-500">
                        Last review time: {Math.floor(deck.last_round_time / 60)}m {deck.last_round_time % 60}s
                      </div>
                    )}
                    {deck.reminder_by && (
                      <div className="text-yellow-400">
                        📅 Review in {deck.reminder_by} day{deck.reminder_by !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Aside - Subject List */}
      <aside className="w-96 border-l border-slate-800 p-6">
        <div className="space-y-3">
          {subjects.map(subject => (
            <button
              key={subject.subject_name}
              onClick={() => {
                setSelectedSubject(subject.subject_name)
                if (activeTab === 'chat') {
                  setActiveTab('notes') // Switch back to notes when selecting a subject
                }
              }}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                subject.subject_name === selectedSubject && activeTab !== 'chat'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <div className="flex-1">
                <div className="font-semibold text-lg">{subject.subject_name}</div>
                {subject.description && (
                  <div className="text-sm opacity-80 mt-1">{subject.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Add New Subject Button */}
        <button 
          onClick={() => setShowSubjectModal(true)}
          className="w-full mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add New Subject
        </button>

        {/* AI Chat Button */}
        <button 
          onClick={() => {
            setActiveTab('chat')
            // Don't deselect subject, just show chat mode
          }}
          className={`w-full mt-4 p-4 font-medium rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/50'
              : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500'
          }`}
        >
          <Bot size={20} />
          AI Chat
        </button>
      </aside>

      {/* Modals */}
      <SubjectModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onSubmit={handleCreateSubject}
        formData={newSubject}
        setFormData={setNewSubject}
        isLoading={createSubjectMutation.isPending}
      />

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSubmit={handleCreateNote}
        formData={newNote}
        setFormData={setNewNote}
        isLoading={createNoteMutation.isPending}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setEditingTask(null)
          setNewTask({ task_title: '', description: '', deadline: null, status: 'Not Started' })
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        formData={newTask}
        setFormData={setNewTask}
        isLoading={editingTask ? updateTaskMutation.isPending : createTaskMutation.isPending}
        isEditing={!!editingTask}
      />

      <DeckModal
        isOpen={showDeckModal}
        onClose={() => setShowDeckModal(false)}
        onSubmit={handleCreateDeck}
        formData={newDeck}
        setFormData={setNewDeck}
        isLoading={createDeckMutation.isPending}
      />

      <NoteEditor
        isOpen={showNoteEditor}
        onClose={() => {
          setShowNoteEditor(false)
          setEditingNote(null)
        }}
        onSubmit={handleUpdateNote}
        note={noteData?.data?.note || editingNote}
        isLoading={updateNoteMutation.isPending}
      />
    </div>
  )
}
