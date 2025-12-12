import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

export const subjectChat = catchAsync(async (req, res, next) => {
  const { subjectName, prompt } = req.body
  if (!process.env.OPENAI_API_KEY) {
    return next(new AppError('AI provider not configured. Set OPENAI_API_KEY in env.', 500))
  }
  if (!prompt) return next(new AppError('Prompt is required', 400))

  const messages = [
    { role: 'system', content: `You are a helpful tutor for the subject: ${subjectName || 'general'}. Answer concisely and include examples.` },
    { role: 'user', content: prompt }
  ]

  const resp = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, max_tokens: 800 })
  })

  if (!resp.ok) {
    const errText = await resp.text()
    return next(new AppError(`AI provider error: ${errText}`, 502))
  }

  const data = await resp.json()
  const reply = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : ''

  res.status(200).json({ status: 'success', data: { reply } })
})

export default { subjectChat }
