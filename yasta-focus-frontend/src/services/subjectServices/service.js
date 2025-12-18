import { api } from '../api'

export const subjectService = {
  // Get all subjects for the current user
  getSubjects: async () => {
    const response = await api.get('/api/subjects')
    return response.data
  },

  // Get a specific subject by name
  getSubject: async (subjectName) => {
    const response = await api.get(`/api/subjects/${encodeURIComponent(subjectName)}`)
    return response.data
  },

  // Create a new subject
  createSubject: async (subjectData) => {
    const response = await api.post('/api/subjects', subjectData)
    return response.data
  },

  // Update a subject
  updateSubject: async (subjectName, updateData) => {
    const response = await api.patch(`/api/subjects/${encodeURIComponent(subjectName)}`, updateData)
    return response.data
  },

  // Delete a subject
  deleteSubject: async (subjectName) => {
    console.log('Deleting subject:', subjectName)
    const response = await api.delete(`/api/subjects/${encodeURIComponent(subjectName)}`)
    console.log('Delete response:', response)
    return response.data
  }
}

export const noteService = {
  // Get all notes for a subject
  getNotes: async (subjectName) => {
    const response = await api.get(`/api/notes/subject/${encodeURIComponent(subjectName)}`)
    return response.data
  },

  // Get a specific note
  getNote: async (subjectName, noteTitle) => {
    const response = await api.get(`/api/notes/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(noteTitle)}`)
    return response.data
  },

  // Create a new note
  createNote: async (subjectName, noteData) => {
    const response = await api.post(`/api/notes/subject/${encodeURIComponent(subjectName)}`, noteData)
    return response.data
  },

  // Update a note
  updateNote: async (subjectName, noteTitle, updateData) => {
    const response = await api.patch(`/api/notes/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(noteTitle)}`, updateData)
    return response.data
  },

  // Delete a note
  deleteNote: async (subjectName, noteTitle) => {
    const response = await api.delete(`/api/notes/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(noteTitle)}`)
    return response.data
  },

  // Search notes
  searchNotes: async (query) => {
    const response = await api.get('/api/notes/search', { params: { q: query } })
    return response.data
  }
}

export const taskService = {
  // Get all tasks for a subject
  getTasks: async (subjectName) => {
    const response = await api.get(`/api/tasks/subject/${encodeURIComponent(subjectName)}`)
    return response.data
  },

  // Get a specific task
  getTask: async (subjectName, taskTitle) => {
    const response = await api.get(`/api/tasks/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(taskTitle)}`)
    return response.data
  },

  // Create a new task
  createTask: async (subjectName, taskData) => {
    const response = await api.post(`/api/tasks/subject/${encodeURIComponent(subjectName)}`, taskData)
    return response.data
  },

  // Update a task
  updateTask: async (subjectName, taskTitle, updateData) => {
    const response = await api.patch(`/api/tasks/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(taskTitle)}`, updateData)
    return response.data
  },

  // Toggle task completion
  toggleTask: async (subjectName, taskTitle) => {
    const response = await api.patch(`/api/tasks/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(taskTitle)}/toggle`)
    return response.data
  },

  // Delete a task
  deleteTask: async (subjectName, taskTitle) => {
    const response = await api.delete(`/api/tasks/subject/${encodeURIComponent(subjectName)}/${encodeURIComponent(taskTitle)}`)
    return response.data
  }
}
