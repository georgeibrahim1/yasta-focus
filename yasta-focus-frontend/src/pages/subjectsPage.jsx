import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Trash2, Edit2 } from 'lucide-react'
import { useGetSubjects, useGetNotes, useDeleteNote, useGetTasks, useToggleTask, useDeleteTask, useCreateSubject, useCreateNote } from '../services/subjectServices'
import { useGetDecks, useDeleteDeck, useCreateDeck } from '../services/deckServices'
import { useCreateTask } from '../services/subjectServices'
import SubjectModal from '../components/SubjectModal'
import NoteModal from '../components/NoteModal'
import TaskModal from '../components/TaskModal'
import DeckModal from '../components/DeckModal'

export default function SubjectsPage() {
  const [activeTab, setActiveTab] = useState('notes')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDeckModal, setShowDeckModal] = useState(false)
  const [newSubject, setNewSubject] = useState({ subject_name: '', description: '' })
  const [newNote, setNewNote] = useState({ note_title: '', note_text: '' })
  const [newTask, setNewTask] = useState({ task_title: '', description: '' })
  const [newDeck, setNewDeck] = useState({ deck_title: '', deck__desc: '', reminder_by: '' })

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
  const toggleTaskMutation = useToggleTask()
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
    createNoteMutation.mutate({ subjectName: selectedSubject, noteData: newNote }, {
      onSuccess: () => {
        setShowNoteModal(false)
        setNewNote({ note_title: '', note_text: '' })
      }
    })
  }

  const handleCreateTask = () => {
    createTaskMutation.mutate({ subjectName: selectedSubject, taskData: newTask }, {
      onSuccess: () => {
        setShowTaskModal(false)
        setNewTask({ task_title: '', description: '' })
      }
    })
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

  const filteredTasks = tasks.filter(task =>
    task.task_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="text-5xl font-bold text-white mb-3">{selectedSubject || 'Select a Subject'}</h1>
          <p className="text-slate-400 text-lg">
            All your notes, tasks, and decks for this subject.
          </p>
        </div>

        {/* Search and Tabs */}
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
                  className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {note.note_title}
                      </h3>
                      <p className="text-slate-300 whitespace-pre-wrap">{note.note_text}</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Created: {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteNoteMutation.mutate({ subjectName: selectedSubject, noteTitle: note.note_title })}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
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
          <div className="space-y-4 max-w-3xl">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No tasks found. Click + to add a new task.
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.task_title}
                  className={`p-5 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors ${
                    task.status === 'completed' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => toggleTaskMutation.mutate({ subjectName: selectedSubject, taskTitle: task.task_title })}
                      className="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
                    />
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                      }`}>
                        {task.task_title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTaskMutation.mutate({ subjectName: selectedSubject, taskTitle: task.task_title })}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Last reviewed: {deck.last_review_date ? new Date(deck.last_review_date).toLocaleDateString() : 'Never'}
                    </span>
                    {deck.reminder_by && (
                      <span className="text-yellow-400">
                        Reminder: {new Date(deck.reminder_by).toLocaleDateString()}
                      </span>
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
              onClick={() => setSelectedSubject(subject.subject_name)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                subject.subject_name === selectedSubject
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <div className="font-semibold text-lg">{subject.subject_name}</div>
              {subject.description && (
                <div className="text-sm opacity-80 mt-1">{subject.description}</div>
              )}
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
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        formData={newTask}
        setFormData={setNewTask}
        isLoading={createTaskMutation.isPending}
      />

      <DeckModal
        isOpen={showDeckModal}
        onClose={() => setShowDeckModal(false)}
        onSubmit={handleCreateDeck}
        formData={newDeck}
        setFormData={setNewDeck}
        isLoading={createDeckMutation.isPending}
      />
    </div>
  )
}
