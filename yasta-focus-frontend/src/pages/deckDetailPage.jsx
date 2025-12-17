import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, Play, BookOpen } from 'lucide-react'
import { useGetFlashcards, useCreateFlashcard, useUpdateFlashcard, useDeleteFlashcard } from '../services/deckServices'
import FlashcardModal from '../components/FlashcardModal'
import ReviewSession from '../components/ReviewSession'

export default function DeckDetailPage() {
  const { subjectName, deckTitle } = useParams()
  const navigate = useNavigate()
  const [showFlashcardModal, setShowFlashcardModal] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState(null)
  const [showReviewSession, setShowReviewSession] = useState(false)
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '' })
  const [flashcardCreateError, setFlashcardCreateError] = useState(null)

  const { data: flashcardsData } = useGetFlashcards(subjectName, deckTitle)
  const createFlashcardMutation = useCreateFlashcard()
  const updateFlashcardMutation = useUpdateFlashcard()
  const deleteFlashcardMutation = useDeleteFlashcard()

  const flashcards = flashcardsData?.data?.flashcards || []

  const handleCreateFlashcard = () => {
    createFlashcardMutation.mutate({
      subjectName,
      deckTitle,
      flashcardData: newFlashcard
    }, {
      onSuccess: () => {
        setShowFlashcardModal(false)
        setNewFlashcard({ question: '', answer: '' })
        setFlashcardCreateError(null)
      },
      onError: (err) => {
        setFlashcardCreateError(err.response?.data?.message || 'An error occurred')
      }
    })
  }

  const handleUpdateFlashcard = () => {
    updateFlashcardMutation.mutate({
      subjectName,
      deckTitle,
      question: editingFlashcard.question,
      updateData: { answer: newFlashcard.answer }
    }, {
      onSuccess: () => {
        setShowFlashcardModal(false)
        setEditingFlashcard(null)
        setNewFlashcard({ question: '', answer: '' })
      }
    })
  }

  const handleEditFlashcard = (flashcard) => {
    setEditingFlashcard(flashcard)
    setNewFlashcard({ question: flashcard.question, answer: flashcard.answer })
    setShowFlashcardModal(true)
  }

  const handleDeleteFlashcard = (question) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcardMutation.mutate({
        subjectName,
        deckTitle,
        question
      })
    }
  }

  const handleStartReview = () => {
    if (flashcards.length === 0) {
      alert('No flashcards to review!')
      return
    }
    setShowReviewSession(true)
  }

  // Group flashcards by status
  const flashcardsByStatus = useMemo(() => {
    const groups = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: []
    }
    flashcards.forEach(card => {
      if (groups[card.status]) {
        groups[card.status].push(card)
      }
    })
    return groups
  }, [flashcards])

  if (showReviewSession) {
    return (
      <ReviewSession
        subjectName={subjectName}
        deckTitle={deckTitle}
        flashcards={flashcards}
        onClose={() => setShowReviewSession(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#10121A] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Subjects
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{deckTitle}</h1>
              <p className="text-slate-400">
                Subject: {subjectName} • {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStartReview}
                disabled={flashcards.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-green-500/50 flex items-center gap-2"
              >
                <Play size={20} />
                Start Review
              </button>
              <button
                onClick={() => setShowFlashcardModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Flashcard
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-6 gap-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center"
            >
              <div className="text-2xl font-bold text-white mb-1">
                {flashcardsByStatus[level]?.length || 0}
              </div>
              <div className="text-xs text-slate-400">
                Level {level}
              </div>
            </div>
          ))}
        </div>

        {/* Flashcards List */}
        <div className="space-y-3">
          {flashcards.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">
                No flashcards yet. Click "Add Flashcard" to get started!
              </p>
            </div>
          ) : (
            flashcards.map(card => (
              <div
                key={card.question}
                className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-400">{card.status}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-2">
                      Q: {card.question}
                    </div>
                    <div className="text-sm text-slate-400">
                      A: {card.answer}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFlashcard(card)}
                      className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Edit flashcard"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteFlashcard(card.question)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete flashcard"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Flashcard Modal */}
      <FlashcardModal
        isOpen={showFlashcardModal}
        onClose={() => {
          setShowFlashcardModal(false)
          setEditingFlashcard(null)
          setNewFlashcard({ question: '', answer: '' })
          setFlashcardCreateError(null)
        }}
        onSubmit={editingFlashcard ? handleUpdateFlashcard : handleCreateFlashcard}
        formData={newFlashcard}
        setFormData={setNewFlashcard}
        isLoading={editingFlashcard ? updateFlashcardMutation.isPending : createFlashcardMutation.isPending}
        isEditing={!!editingFlashcard}
        error={flashcardCreateError}
      />
    </div>
  )
}
