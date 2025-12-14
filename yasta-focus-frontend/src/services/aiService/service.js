import { api } from '../api'

// Subject-specific chat (tutor) - Uses Groq (Llama 3.3 70B)
export const subjectChat = async (subjectName, prompt) => {
  try {
    const res = await api.post('/api/ai/subject-chat', { 
      subjectName, 
      prompt 
    })
    
    // Return the data directly for easier access
    return res.data.data
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.message || 'Server error')
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Check your connection.')
    } else {
      // Something else happened
      throw new Error(error.message || 'Failed to send message')
    }
  }
}

export default { subjectChat }