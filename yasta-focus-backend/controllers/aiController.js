// aiController.js - AI chatbot controller using Groq API
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

// Groq AI chat function - Using FREE Llama 3.3 70B model (UNLIMITED requests)
const chatWithGroq = async (userMessage, apiKey, systemContext = '') => {
  const fullPrompt = systemContext 
    ? `${systemContext}\n\n${userMessage}`
    : userMessage

  const url = 'https://api.groq.com/openai/v1/chat/completions'
  
  console.log('🚀 Calling Groq API with Llama 3.3 70B (UNLIMITED)')
  
  const requestBody = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2048
  }

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    const data = await resp.json()

    if (!resp.ok) {
      console.error('❌ Groq API Error:', resp.status, data)
      throw new Error(data.error?.message || `Groq API error: ${resp.status}`)
    }
    
    // Extract response
    if (data.choices?.[0]?.message?.content) {
      console.log('✅ Groq response received')
      return data.choices[0].message.content
    }
    
    console.error('❌ Unexpected Groq response format:', JSON.stringify(data))
    throw new Error('Unexpected response format from Groq API')
  } catch (error) {
    console.error('❌ Error calling Groq:', error.message)
    throw error
  }
}

// Subject-specific chat (tutor) with Groq AI
export const subjectChat = catchAsync(async (req, res, next) => {
  const { subjectName, prompt } = req.body

  console.log('📚 Subject Chat Request:', { subjectName, prompt: prompt?.substring(0, 50) })

  // Use Groq exclusively
  const groqKey = process.env.GROQ_API_KEY

  if (!groqKey) {
    console.error('❌ Groq API key not configured')
    return next(new AppError('AI service not configured. Set GROQ_API_KEY in config.env', 500))
  }

  if (!prompt) {
    return next(new AppError('Prompt is required', 400))
  }

  const systemContext = `You are a helpful tutor for the subject: ${subjectName || 'general'}. Answer concisely and include examples when appropriate.`

  try {
    console.log('🚀 Using Groq API (Llama 3.3 70B)')
    const reply = await chatWithGroq(prompt, groqKey, systemContext)

    console.log('✅ AI response received:', reply?.substring(0, 100))

    res.status(200).json({
      status: 'success',
      data: { reply }
    })
  } catch (error) {
    console.error('❌ Groq API error:', error.message)
    return next(new AppError(`AI service error: ${error.message}`, 500))
  }
})

export default { subjectChat }