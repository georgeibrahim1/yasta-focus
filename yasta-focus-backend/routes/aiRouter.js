
import express from 'express'
import * as aiController from '../controllers/aiController.js'
import { protect } from '../controllers/authController.js'

const router = express.Router()

// Middleware for request validation
const validateChatRequest = (req, res, next) => {
  const { message } = req.body
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Message is required and must be a non-empty string'
    })
  }
  
  next()
}

// Rate limiting middleware
const rateLimitMap = new Map()

const rateLimit = (req, res, next) => {
  const userId = req.user?.id || req.ip
  const now = Date.now()
  const userRequests = rateLimitMap.get(userId) || []
  
  // Remove requests older than 1 minute
  const recentRequests = userRequests.filter(time => now - time < 60000)
  
  if (recentRequests.length >= 30) {
    return res.status(429).json({
      status: 'fail',
      message: 'Too many requests. Please try again later.'
    })
  }
  
  recentRequests.push(now)
  rateLimitMap.set(userId, recentRequests)
  next()
}

// All routes require authentication
router.use(protect)

// AI Chat route - Uses Groq (Llama 3.3 70B)
router.post('/subject-chat', aiController.subjectChat)

export default router