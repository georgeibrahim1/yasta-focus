import { useState, useEffect } from 'react'
import { X, ChevronRight, RotateCcw } from 'lucide-react'
import { useUpdateFlashcardConfidence } from '../services/deckServices'
import { useUpdateDeck } from '../services/deckServices'

export default function ReviewSession({ subjectName, deckTitle, flashcards, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewedCards, setReviewedCards] = useState([])
  const [sessionStartTime] = useState(Date.now())
  const [isCompleting, setIsCompleting] = useState(false)

  const updateConfidenceMutation = useUpdateFlashcardConfidence()
  const updateDeckMutation = useUpdateDeck()

  const currentCard = flashcards[currentIndex]
  const progress = ((reviewedCards.length) / flashcards.length) * 100

  const handleConfidenceSelect = async (confidence) => {
    try {
      await updateConfidenceMutation.mutateAsync({
        subjectName,
        deckTitle,
        question: currentCard.question,
        confidence
      })

      setReviewedCards([...reviewedCards, currentCard.question])

      // Move to next card or complete session
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        completeSession()
      }
    } catch (error) {
      console.error('Error updating confidence:', error)
    }
  }

  const completeSession = async () => {
    setIsCompleting(true)
    const reviewTimeSeconds = Math.floor((Date.now() - sessionStartTime) / 1000)
    
    try {
      await updateDeckMutation.mutateAsync({
        subjectName,
        deckTitle,
        updateData: {
          last_review_date: new Date().toISOString(),
          last_round_time: reviewTimeSeconds
        }
      })
      
      // Show completion message
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error completing session:', error)
      onClose()
    }
  }

  const confidenceLevels = [
    { value: 0, label: 'Again', color: 'from-red-600 to-red-700', hoverColor: 'hover:from-red-700 hover:to-red-800' },
    { value: 1, label: 'Hard', color: 'from-orange-600 to-orange-700', hoverColor: 'hover:from-orange-700 hover:to-orange-800' },
    { value: 2, label: 'Good', color: 'from-yellow-600 to-yellow-700', hoverColor: 'hover:from-yellow-700 hover:to-yellow-800' },
    { value: 3, label: 'Easy', color: 'from-lime-600 to-lime-700', hoverColor: 'hover:from-lime-700 hover:to-lime-800' },
    { value: 4, label: 'Very Easy', color: 'from-green-600 to-green-700', hoverColor: 'hover:from-green-700 hover:to-green-800' },
    { value: 5, label: 'Perfect', color: 'from-emerald-600 to-emerald-700', hoverColor: 'hover:from-emerald-700 hover:to-emerald-800' }
  ]

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-[#10121A] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
            <div className="text-5xl">🎉</div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Review Complete!</h2>
          <p className="text-slate-400 text-lg">
            You reviewed {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
          </p>
          <div className="mt-4 inline-block px-6 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-sm text-slate-400">
              Time: {Math.floor((Date.now() - sessionStartTime) / 60000)}m {Math.floor(((Date.now() - sessionStartTime) % 60000) / 1000)}s
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#10121A] flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white">{deckTitle}</h1>
              <p className="text-sm text-slate-400">
                Card {currentIndex + 1} of {flashcards.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Question Card */}
          <div className="relative mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-30"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 min-h-[300px] flex flex-col">
              <div className="mb-4">
                <span className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Question</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl text-white text-center leading-relaxed">
                  {currentCard.question}
                </p>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          {showAnswer ? (
            <div className="space-y-6">
              {/* Answer Card */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl blur-xl opacity-20"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 min-h-[200px] flex flex-col">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-green-400 uppercase tracking-wider">Answer</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl text-white text-center leading-relaxed">
                      {currentCard.answer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Selection */}
              <div>
                <p className="text-center text-slate-400 mb-4">How well did you know this?</p>
                <div className="grid grid-cols-3 gap-3">
                  {confidenceLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => handleConfidenceSelect(level.value)}
                      disabled={updateConfidenceMutation.isPending}
                      className={`p-4 bg-gradient-to-r ${level.color} ${level.hoverColor} rounded-xl text-white font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="text-2xl font-bold mb-1">{level.value}</div>
                      <div className="text-sm">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setShowAnswer(true)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2 mx-auto"
              >
                Show Answer
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm">
          <div className="text-slate-400">
            Current Level: <span className="text-white font-semibold">{currentCard.status}</span>
          </div>
          <div className="text-slate-400">
            Reviewed: <span className="text-white font-semibold">{reviewedCards.length}</span> / {flashcards.length}
          </div>
        </div>
      </div>
    </div>
  )
}
