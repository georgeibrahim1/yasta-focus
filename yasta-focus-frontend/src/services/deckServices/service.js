import { api } from '../api'

export const deckService = {
  // Get all decks for a subject
  getDecks: async (subjectName) => {
    const response = await api.get(`/api/decks/subject/${encodeURIComponent(subjectName)}`)
    return response.data
  },

  // Get a specific deck
  getDeck: async (subjectName, deckTitle) => {
    const response = await api.get(`/api/decks/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(deckTitle)}`)
    return response.data
  },

  // Create a new deck
  createDeck: async (subjectName, deckData) => {
    const response = await api.post(`/api/decks/subject/${encodeURIComponent(subjectName)}`, deckData)
    return response.data
  },

  // Update a deck
  updateDeck: async (subjectName, deckTitle, updateData) => {
    const response = await api.patch(`/api/decks/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(deckTitle)}`, updateData)
    return response.data
  },

  // Delete a deck
  deleteDeck: async (subjectName, deckTitle) => {
    const response = await api.delete(`/api/decks/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(deckTitle)}`)
    return response.data
  }
}

export const flashcardService = {
  // Get all flashcards for a deck
  getFlashcards: async (subjectName, deckTitle) => {
    const response = await api.get(`/api/flashcards/subject/${encodeURIComponent(subjectName)}/deck/${encodeURIComponent(deckTitle)}`)
    return response.data
  },

  // Get a specific flashcard
  getFlashcard: async (subjectName, deckTitle, question) => {
    const response = await api.get(`/api/flashcards/subject/${encodeURIComponent(subjectName)}/deck/${encodeURIComponent(deckTitle)}/${encodeURIComponent(question)}`)
    return response.data
  },

  // Create a new flashcard
  createFlashcard: async (subjectName, deckTitle, flashcardData) => {
    const response = await api.post(`/api/flashcards/subject/${encodeURIComponent(subjectName)}/deck/${encodeURIComponent(deckTitle)}`, flashcardData)
    return response.data
  },

  // Update a flashcard
  updateFlashcard: async (subjectName, deckTitle, question, updateData) => {
    const response = await api.patch(`/api/flashcards/subject/${encodeURIComponent(subjectName)}/deck/${encodeURIComponent(deckTitle)}/${encodeURIComponent(question)}`, updateData)
    return response.data
  },

  // Update flashcard confidence (for spaced repetition)
  updateFlashcardConfidence: async (subjectName, deckTitle, question, confidence) => {
    const response = await api.patch(`/api/flashcards/subject/${encodeURIComponent(subjectName)}/deck/${encodeURIComponent(deckTitle)}/${encodeURIComponent(question)}/confidence`, { confidence })
    return response.data
  },

  // Delete a flashcard
  deleteFlashcard: async (subjectName, deckTitle, question) => {
    const response = await api.delete(`/api/flashcards/subject/${encodeURIComponent(subjectName)}/deck/${encodeURIComponent(deckTitle)}/${encodeURIComponent(question)}`)
    return response.data
  }
}
